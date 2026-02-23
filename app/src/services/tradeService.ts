import { supabase } from '@/lib/supabase';
import type { TradeOrder, Transaction } from '@/types';

interface TradeResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
  error?: string;
}

// Execute a buy order
export const executeBuy = async (
  userId: string,
  symbol: string,
  companyName: string,
  exchange: string,
  quantity: number,
  price: number
): Promise<TradeResult> => {
  try {
    // Validate inputs
    if (!userId) {
      return { success: false, message: 'User not authenticated', error: 'AUTH_REQUIRED' };
    }

    if (!symbol || !companyName || quantity <= 0 || price <= 0) {
      return { success: false, message: 'Invalid trade parameters', error: 'INVALID_PARAMS' };
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { success: false, message: 'Failed to fetch user profile', error: 'PROFILE_ERROR' };
    }

    const totalAmount = quantity * price;

    // Check if user has sufficient balance
    if (profile.balance < totalAmount) {
      return { 
        success: false, 
        message: `Insufficient balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${profile.balance.toFixed(2)}`,
        error: 'INSUFFICIENT_BALANCE'
      };
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        symbol: symbol,
        company_name: companyName,
        exchange: exchange,
        transaction_type: 'BUY',
        quantity: quantity,
        price: price,
        total_amount: totalAmount,
        currency: 'INR',
      }])
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return { success: false, message: 'Failed to create transaction', error: 'TRANSACTION_ERROR' };
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - totalAmount })
      .eq('id', userId);

    if (balanceError) {
      console.error('Balance update error:', balanceError);
      // Attempt to rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return { success: false, message: 'Failed to update balance', error: 'BALANCE_ERROR' };
    }

    // Check if user already has this stock in portfolio
    const { data: existingPortfolio } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (existingPortfolio) {
      // Update existing portfolio entry
      const newQuantity = existingPortfolio.quantity + quantity;
      const newTotalInvestment = existingPortfolio.total_investment + totalAmount;
      const newAvgPrice = newTotalInvestment / newQuantity;

      const { error: portfolioError } = await supabase
        .from('portfolio')
        .update({
          quantity: newQuantity,
          avg_buy_price: newAvgPrice,
          total_investment: newTotalInvestment,
          current_price: price,
          current_value: newQuantity * price,
          unrealized_pnl: (newQuantity * price) - newTotalInvestment,
          unrealized_pnl_percent: ((newQuantity * price) - newTotalInvestment) / newTotalInvestment * 100,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existingPortfolio.id);

      if (portfolioError) {
        console.error('Portfolio update error:', portfolioError);
      }
    } else {
      // Create new portfolio entry
      const { error: portfolioError } = await supabase
        .from('portfolio')
        .insert([{
          user_id: userId,
          symbol: symbol,
          company_name: companyName,
          exchange: exchange,
          quantity: quantity,
          avg_buy_price: price,
          total_investment: totalAmount,
          current_price: price,
          current_value: totalAmount,
          unrealized_pnl: 0,
          unrealized_pnl_percent: 0,
        }]);

      if (portfolioError) {
        console.error('Portfolio insert error:', portfolioError);
      }
    }

    return {
      success: true,
      message: `Successfully bought ${quantity} shares of ${symbol} at ₹${price.toFixed(2)}`,
      transaction: transaction as Transaction,
    };

  } catch (error: any) {
    console.error('Execute buy error:', error);
    return { success: false, message: error.message || 'Trade execution failed', error: 'UNKNOWN_ERROR' };
  }
};

// Execute a sell order
export const executeSell = async (
  userId: string,
  symbol: string,
  companyName: string,
  exchange: string,
  quantity: number,
  price: number
): Promise<TradeResult> => {
  try {
    // Validate inputs
    if (!userId) {
      return { success: false, message: 'User not authenticated', error: 'AUTH_REQUIRED' };
    }

    if (!symbol || !companyName || quantity <= 0 || price <= 0) {
      return { success: false, message: 'Invalid trade parameters', error: 'INVALID_PARAMS' };
    }

    // Get user's portfolio for this stock
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();

    if (portfolioError || !portfolio) {
      return { success: false, message: 'You do not own this stock', error: 'NO_HOLDINGS' };
    }

    // Check if user has sufficient quantity
    if (portfolio.quantity < quantity) {
      return { 
        success: false, 
        message: `Insufficient shares. You own ${portfolio.quantity} shares, trying to sell ${quantity}`,
        error: 'INSUFFICIENT_SHARES'
      };
    }

    const totalAmount = quantity * price;
    const realizedPnl = (price - portfolio.avg_buy_price) * quantity;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        symbol: symbol,
        company_name: companyName,
        exchange: exchange,
        transaction_type: 'SELL',
        quantity: quantity,
        price: price,
        total_amount: totalAmount,
        realized_pnl: realizedPnl,
        currency: 'INR',
      }])
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return { success: false, message: 'Failed to create transaction', error: 'TRANSACTION_ERROR' };
    }

    // Get user's current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { success: false, message: 'Failed to fetch user profile', error: 'PROFILE_ERROR' };
    }

    // Update user balance (add sale proceeds)
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance + totalAmount })
      .eq('id', userId);

    if (balanceError) {
      console.error('Balance update error:', balanceError);
      // Attempt to rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return { success: false, message: 'Failed to update balance', error: 'BALANCE_ERROR' };
    }

    // Update portfolio
    const newQuantity = portfolio.quantity - quantity;

    if (newQuantity > 0) {
      const newTotalInvestment = portfolio.avg_buy_price * newQuantity;
      
      const { error: updateError } = await supabase
        .from('portfolio')
        .update({
          quantity: newQuantity,
          total_investment: newTotalInvestment,
          current_price: price,
          current_value: newQuantity * price,
          unrealized_pnl: (newQuantity * price) - newTotalInvestment,
          unrealized_pnl_percent: ((newQuantity * price) - newTotalInvestment) / newTotalInvestment * 100,
          last_updated: new Date().toISOString(),
        })
        .eq('id', portfolio.id);

      if (updateError) {
        console.error('Portfolio update error:', updateError);
      }
    } else {
      // Remove from portfolio if all shares sold
      const { error: deleteError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', portfolio.id);

      if (deleteError) {
        console.error('Portfolio delete error:', deleteError);
      }
    }

    return {
      success: true,
      message: `Successfully sold ${quantity} shares of ${symbol} at ₹${price.toFixed(2)}. P&L: ₹${realizedPnl.toFixed(2)}`,
      transaction: transaction as Transaction,
    };

  } catch (error: any) {
    console.error('Execute sell error:', error);
    return { success: false, message: error.message || 'Trade execution failed', error: 'UNKNOWN_ERROR' };
  }
};

// Validate a trade order
export const validateTrade = (
  order: TradeOrder,
  balance: number,
  holdings: number = 0
): { valid: boolean; error?: string } => {
  const { transaction_type, quantity, price } = order;
  const totalAmount = quantity * price;

  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }

  if (price <= 0) {
    return { valid: false, error: 'Invalid price' };
  }

  if (transaction_type === 'BUY') {
    if (totalAmount > balance) {
      return { valid: false, error: 'Insufficient balance' };
    }
  } else if (transaction_type === 'SELL') {
    if (quantity > holdings) {
      return { valid: false, error: 'Insufficient shares' };
    }
  }

  return { valid: true };
};

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendWeeklyReportEmail } from '@/lib/email';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get last week's trades
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.userId,
        tradeDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const profitableTrades = closedTrades.filter(t => (t.profitLoss || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.profitLoss || 0) < 0);
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
    const winRate = closedTrades.length > 0 
      ? (profitableTrades.length / closedTrades.length) * 100 
      : 0;

    // Find best and worst trades
    let bestTrade = null;
    let worstTrade = null;
    
    if (closedTrades.length > 0) {
      const sortedByPnL = [...closedTrades].sort((a, b) => (b.profitLoss || 0) - (a.profitLoss || 0));
      if (sortedByPnL[0]?.profitLoss && sortedByPnL[0].profitLoss > 0) {
        bestTrade = { symbol: sortedByPnL[0].symbol, pnl: sortedByPnL[0].profitLoss };
      }
      const worst = sortedByPnL[sortedByPnL.length - 1];
      if (worst?.profitLoss && worst.profitLoss < 0) {
        worstTrade = { symbol: worst.symbol, pnl: worst.profitLoss };
      }
    }

    // Send the email
    const success = await sendWeeklyReportEmail(user.email, {
      name: user.name,
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      winRate,
      totalPnL,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      bestTrade,
      worstTrade,
      currency: 'INR', // Default, could be fetched from user preferences
      weekStart: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekEnd: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    if (success) {
      return NextResponse.json({ message: 'Test report sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send test report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

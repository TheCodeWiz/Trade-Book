import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const goal = await prisma.goal.findUnique({
      where: {
        userId_month_year: {
          userId: session.userId,
          month,
          year,
        },
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { month, year, targetPnL, targetWinRate, maxTradesPerDay } = body;

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const goal = await prisma.goal.upsert({
      where: {
        userId_month_year: {
          userId: session.userId,
          month,
          year,
        },
      },
      update: {
        targetPnL,
        targetWinRate,
        maxTradesPerDay,
      },
      create: {
        userId: session.userId,
        month,
        year,
        targetPnL,
        targetWinRate,
        maxTradesPerDay,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Save goal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

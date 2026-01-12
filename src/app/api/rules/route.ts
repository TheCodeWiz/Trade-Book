import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await prisma.tradingRule.findMany({
      where: { userId: session.userId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
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
    const { rule } = body;

    if (!rule) {
      return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
    }

    // Get the max order
    const maxOrder = await prisma.tradingRule.findFirst({
      where: { userId: session.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newRule = await prisma.tradingRule.create({
      data: {
        userId: session.userId,
        rule,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return NextResponse.json(newRule);
  } catch (error) {
    console.error('Create rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive, rule } = body;

    // Verify ownership
    const existingRule = await prisma.tradingRule.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const updated = await prisma.tradingRule.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(rule && { rule }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const rule = await prisma.tradingRule.findFirst({
      where: { id, userId: session.userId },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    await prisma.tradingRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete rule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

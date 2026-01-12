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
    const { action } = body;

    // Verify ownership
    const mistake = await prisma.mistake.findFirst({
      where: { id, userId: session.userId },
    });

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    if (action === 'increment') {
      const updated = await prisma.mistake.update({
        where: { id },
        data: { frequency: { increment: 1 } },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update mistake error:', error);
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
    const mistake = await prisma.mistake.findFirst({
      where: { id, userId: session.userId },
    });

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    await prisma.mistake.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete mistake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

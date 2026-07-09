import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'predictions';

  try {
    const mod = await import('@/lib/predictiveDb');

    if (mode === 'equipment') {
      return NextResponse.json({ equipment: mod.getEquipment() });
    }
    if (mode === 'stats') {
      return NextResponse.json(mod.getStats());
    }
    return NextResponse.json({ predictions: mod.getPredictions() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mod = await import('@/lib/predictiveDb');
    const { action } = body;

    if (action === 'acknowledge') {
      const result = mod.acknowledgePrediction(body.predictionId);
      if (!result) return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
      return NextResponse.json({ prediction: result });
    }

    if (action === 'add-equipment') {
      const result = mod.addEquipment(body.equipment);
      return NextResponse.json({ equipment: result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

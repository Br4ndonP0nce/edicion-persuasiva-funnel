import { NextRequest, NextResponse } from "next/server";
import { isSlugAvailable } from "@/lib/firebase/db";

export async function POST(request: NextRequest) {
  try {
    const { slug, excludeId } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { 
          isValid: false, 
          isAvailable: false, 
          message: 'El slug debe contener solo letras, números y guiones (3-50 caracteres)'
        },
        { status: 200 }
      );
    }

    // Check availability
    const available = await isSlugAvailable(slug, excludeId);

    return NextResponse.json({
      isValid: true,
      isAvailable: available,
      message: available ? 'Slug disponible' : 'Este slug ya está en uso'
    });

  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Parameters<typeof supabaseResponse.cookies.set>[2];
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
  pathname.startsWith("/login") ||
  pathname.startsWith("/signup") ||
  pathname.startsWith("/forgot-password") ||
  pathname.startsWith("/reset-password") ||
  pathname.startsWith("/auth");
  const isCompleteProfileRoute = pathname === "/complete-profile";
  const isLicenseExpiredRoute = pathname === "/license-expired";
  const isApiRoute = pathname.startsWith("/api");
  const isProtected =
    pathname === "/" ||
    pathname.startsWith("/rides") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/activity");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // License check for ALL authenticated users (email + OAuth)
  // Order: 1. no license → /complete-profile, 2. expired → /license-expired, 3. active → allow
  if (user && !isAuthRoute && !isLicenseExpiredRoute && !isApiRoute && !isCompleteProfileRoute) {
    const { data: license } = await supabase
      .from("user_licenses")
      .select("license_status, expires_at")
      .eq("user_id", user.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 1. No license at all → redirect to complete-profile
    if (!license) {
      const completeProfileUrl = request.nextUrl.clone();
      completeProfileUrl.pathname = "/complete-profile";
      completeProfileUrl.search = "";
      return NextResponse.redirect(completeProfileUrl);
    }

    // 2. License exists but expired → redirect to license-expired
    const isExpired = new Date(license.expires_at) <= new Date();
    const isActive = license.license_status === "active";

    if (!isActive || isExpired) {
      const licenseExpiredUrl = request.nextUrl.clone();
      licenseExpiredUrl.pathname = "/license-expired";
      licenseExpiredUrl.search = "";
      return NextResponse.redirect(licenseExpiredUrl);
    }

    // 3. Active and not expired → allow access (continues below)
  }

  // Check if user needs to complete profile (display_name)
  // This runs AFTER license check, so user already has a license
  if (user && !isCompleteProfileRoute && !isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    if (profile && !profile.display_name) {
      const completeProfileUrl = request.nextUrl.clone();
      completeProfileUrl.pathname = "/complete-profile";
      completeProfileUrl.search = "";
      return NextResponse.redirect(completeProfileUrl);
    }
  }

  // Redirect authenticated users away from auth routes (after all checks)
  if (user && isAuthRoute) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return supabaseResponse;
}

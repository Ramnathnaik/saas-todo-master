import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhook/register",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Clerk middleware
export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && !isPublicRoute(request)) {
    return redirectToSignIn();
  }

  if (userId) {
    try {
      const user = await (await clerkClient()).users.getUser(userId as string);
      const role = user.publicMetadata.role as string | undefined;

      // Admin role redirection logic
      if (role === "admin" && request.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // Prevent non-admin users from accessing admin routes
      if (role !== "admin" && request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Redirect authenticated users trying to access public routes
      if (isPublicRoute(request)) {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            request.url
          )
        );
      }
    } catch (error) {
      console.error("Error fetching user data from Clerk:", error);
      return NextResponse.redirect(new URL("/error", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

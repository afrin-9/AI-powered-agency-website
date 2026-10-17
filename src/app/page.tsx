import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-powered agency</CardTitle>
          <CardDescription>
            Next.js 15 · Prisma + Neon · Auth.js · shadcn/ui · Claude
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          {session?.user ? (
            <>
              <p className="text-sm">Signed in as {session.user.email ?? session.user.name}</p>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button variant="outline" type="submit">Sign out</Button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <Button type="submit">Sign in with GitHub</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

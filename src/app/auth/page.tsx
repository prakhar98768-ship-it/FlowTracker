"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { getAllChapters } from "@/lib/syllabus";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function seedChapters(userId: string) {
    const chapters = getAllChapters();
    const rows = chapters.map((ch) => ({
      user_id: userId,
      subject: ch.subject,
      class_number: ch.classNumber,
      chapter_name: ch.name,
      progress: 0,
      status: "not_started" as const,
      notes: "",
      revision_done: false,
      questions_done: false,
      ncert_done: false,
    }));

    await supabase.from("chapter_progress").upsert(rows, {
      onConflict: "user_id,subject,class_number,chapter_name",
      ignoreDuplicates: true,
    });
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await seedChapters(data.user.id);
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-biology/5 via-transparent to-physics/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-biology/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-physics/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-biology to-physics flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">StudyFlow</h1>
          </div>
          <p className="text-muted-foreground text-sm">Track your NEET preparation</p>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription>Sign in to sync your progress across devices</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={handleLogin} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Display Name</Label>
                  <Input
                    id="reg-name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={handleRegister} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

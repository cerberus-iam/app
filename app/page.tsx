import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}

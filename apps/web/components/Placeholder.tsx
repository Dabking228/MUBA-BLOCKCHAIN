import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";

/** Temporary page scaffold — replaced feature-by-feature during the build. */
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="flex flex-col gap-2 pt-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardContent>
    </Card>
  );
}

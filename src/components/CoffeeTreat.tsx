import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const CoffeeTreat = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent-foreground transition-colors">
          <Heart className="w-3.5 h-3.5" />
          <span>Buy me a coffee</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">💷 Treat the Author</DialogTitle>
          <DialogDescription className="text-center">
            If Calm helps you stay focused and hydrated, consider buying the author a coffee as a small thank you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-border"
              onClick={() => window.open("https://buymeacoffee.com/JettZ", "_blank")}
            >
              💷 £3
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-border"
              onClick={() => window.open("https://buymeacoffee.com/JettZ", "_blank")}
            >
              💷💷 £5
            </Button>
            <Button
              className="rounded-full bg-primary text-primary-foreground"
              onClick={() => window.open("https://buymeacoffee.com/JettZ", "_blank")}
            >
              💷💷💷 £10
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Every sip counts 💚</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoffeeTreat;

"use client";

import { MatchForm } from "@/app/dashboard/(components)/match-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Match } from "@prisma/client";
import { motion } from "framer-motion";
import { ArrowRightIcon, BugIcon, Edit3Icon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import { toast } from "sonner";

type MatchItemProps = {
  deleteMatch: () => Promise<void>;
  listIndex: number;
  match: Match;
};

export const MatchItem: FC<MatchItemProps> = ({
  deleteMatch,
  listIndex,
  match,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onDeleteMatch: () => Promise<void> = async () => {
    try {
      await deleteMatch();
    } catch (error) {
      if (error instanceof Error) {
        toast("Ha ocurrido un error.", {
          description: error.message,
          icon: <BugIcon className="h-4 opacity-50 w-4" />,
        });
      }

      return;
    }

    toast("Se ha eliminado tu partido.", {
      icon: <TrashIcon className="h-4 opacity-50 w-4" />,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: listIndex * 0.15 }}
    >
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <TrashIcon className="h-4 text-red-700 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de eliminar este partido?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={onDeleteMatch}>Eliminar</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit3Icon className="h-4 text-slate-500 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar partido</DialogTitle>
            </DialogHeader>
            <MatchForm
              mode="edit"
              match={match}
              onFinish={() => {
                setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
        <div className="grow">
          <Link href={`/matches/${match.id}`}>
            <div className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors">
              <div className="flex items-center justify-between gap-4">
                <p>{match.name}</p>
                <ArrowRightIcon className="h-4 text-slate-500 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

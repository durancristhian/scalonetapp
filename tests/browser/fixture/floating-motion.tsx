import * as Select from "@/components/ui/select";
import * as Popover from "@/components/ui/popover";
import * as Menu from "@/components/ui/dropdown-menu";
import * as Sheet from "@/components/ui/sheet";
import * as Dialog from "@/components/ui/dialog";
import * as Alert from "@/components/ui/alert-dialog";

export function FloatingMotionFixture() {
  return (
    <main className="flex min-h-dvh flex-col items-start gap-4 p-4">
      <Select.Select>
        <Select.SelectTrigger aria-label="Select" className="w-60">
          <Select.SelectValue placeholder="Elegir jugador" />
        </Select.SelectTrigger>
        <Select.SelectContent aria-label="Jugadores">
          <Select.SelectItem value="ana">Ana</Select.SelectItem>
          <Select.SelectItem value="leo">Leo</Select.SelectItem>
        </Select.SelectContent>
      </Select.Select>
      <Popover.Popover>
        <Popover.PopoverTrigger>Popover</Popover.PopoverTrigger>
        <Popover.PopoverContent aria-label="Opciones">
          <button>Editar jugador</button>
        </Popover.PopoverContent>
      </Popover.Popover>
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger>DropdownMenu</Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent aria-label="Acciones">
          <Menu.DropdownMenuItem>Editar</Menu.DropdownMenuItem>
          <Menu.DropdownMenuItem>Guardar</Menu.DropdownMenuItem>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
      <Sheet.Sheet>
        <Sheet.SheetTrigger>Sheet</Sheet.SheetTrigger>
        <Sheet.SheetContent>
          <Sheet.SheetTitle>Navegación</Sheet.SheetTitle>
          <Sheet.SheetDescription>Opciones del partido</Sheet.SheetDescription>
          <button>Ver jugadores</button>
        </Sheet.SheetContent>
      </Sheet.Sheet>
      <Dialog.Dialog>
        <Dialog.DialogTrigger>Dialog</Dialog.DialogTrigger>
        <Dialog.DialogContent>
          <Dialog.DialogTitle>Editar partido</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Opciones del partido
          </Dialog.DialogDescription>
          <button>Guardar</button>
        </Dialog.DialogContent>
      </Dialog.Dialog>
      <Alert.AlertDialog>
        <Alert.AlertDialogTrigger>AlertDialog</Alert.AlertDialogTrigger>
        <Alert.AlertDialogContent>
          <Alert.AlertDialogTitle>Eliminar partido</Alert.AlertDialogTitle>
          <Alert.AlertDialogDescription>
            Confirmar eliminación
          </Alert.AlertDialogDescription>
          <Alert.AlertDialogCancel>Cancelar</Alert.AlertDialogCancel>
          <Alert.AlertDialogAction>Eliminar</Alert.AlertDialogAction>
        </Alert.AlertDialogContent>
      </Alert.AlertDialog>
    </main>
  );
}

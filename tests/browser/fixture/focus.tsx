import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

export function FocusFixture() {
  return (
    <section
      aria-label="Controles de foco"
      style={{
        padding: 16,
        display: "grid",
        gap: 16,
        minHeight: "100vh",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      <a href="#controls" className={navigationMenuTriggerStyle()}>
        Navegación
      </a>
      <Button>Principal</Button>
      <Button variant="outline">Secundario</Button>
      <Button disabled>Deshabilitado</Button>
      <Input aria-label="Nombre" />
      <Textarea aria-label="Descripción" />
      <Toggle aria-label="Seleccionar">Seleccionar</Toggle>
      <RadioGroup defaultValue="a" aria-label="Equipo">
        <RadioGroupItem value="a" aria-label="Azules" />
        <RadioGroupItem value="b" aria-label="Rojos" />
      </RadioGroup>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Jugadores</TabsTrigger>
          <TabsTrigger value="b">Equipos</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Lista de jugadores</TabsContent>
        <TabsContent value="b">Lista de equipos</TabsContent>
      </Tabs>
      <Select defaultValue="a">
        <SelectTrigger aria-label="Posición">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 20 }, (_, i) => (
            <SelectItem key={i} value={i === 0 ? "a" : String(i)}>
              Posición {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
}

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ListChecks, Info } from "lucide-react";
import { ReactNode } from "react";

export default function TarifsTabsWrapper({
  formulesContent,
  optionsContent,
  practicalContent,
}: {
  formulesContent: ReactNode;
  optionsContent: ReactNode;
  practicalContent: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tarifs</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gérez les formules, options et informations pratiques
        </p>
      </div>

      <Tabs defaultValue="formules">
        <TabsList>
          <TabsTrigger value="formules" className="gap-2">
            <DollarSign className="size-4" />
            Formules
          </TabsTrigger>
          <TabsTrigger value="options" className="gap-2">
            <ListChecks className="size-4" />
            Options
          </TabsTrigger>
          <TabsTrigger value="practical" className="gap-2">
            <Info className="size-4" />
            Infos pratiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formules" className="mt-6">
          {formulesContent}
        </TabsContent>

        <TabsContent value="options" className="mt-6">
          {optionsContent}
        </TabsContent>

        <TabsContent value="practical" className="mt-6">
          {practicalContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}

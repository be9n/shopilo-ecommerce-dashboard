"use client"

import { PermissionNode } from "@/types/global";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import React from "react";

const PermissionNodes = ({
  permissions,
  toggleNames,
  isChecked,
}: {
  permissions: PermissionNode[];
  toggleNames: (checked: boolean, node?: PermissionNode) => void;
  isChecked: (node: PermissionNode) => boolean;
}) => {
  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap ms-4">
        {permissions.map((permission) => (
          <FormItem key={permission.id} className="flex !flex-row items-center gap-4">
            <FormControl>
              <Checkbox
                className="cursor-pointer"
                checked={isChecked(permission)}
                onCheckedChange={(checked: boolean) => {
                  toggleNames(checked, permission);
                }}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal cursor-pointer">
              {permission.title}
            </FormLabel>
          </FormItem>
        ))}
      </div>
    </div>
  );
};

export default PermissionNodes;

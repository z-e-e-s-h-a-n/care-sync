/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import type { AnyFormApi } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import GenericFormTable from "@/components/shared/GenericFormTable";
import type { ColumnConfig } from "@/components/shared/GenericTable";
import type { ArrayItem } from "@workspace/contracts";

export interface ArrayFormItemProps<TItem, TCtx = any> {
  onSubmit: (item: TItem) => void;
  disabled?: boolean;
  children: (submit: () => void, onCancel: () => void) => React.ReactNode;
  editData?: TItem;
  clearEditData: () => void;
  items: TItem[];
  ctx?: TCtx;
}

export type ArrayFormItem<TItem, TCtx = any> = React.ComponentType<
  ArrayFormItemProps<TItem, TCtx>
>;

export type ArrayFieldSideEffect<TFormData, TItem, TCtx> = (args: {
  form: AnyFormApi<TFormData>;
  items: TItem[];
  ctx?: TCtx;
}) => void;

interface GenericArrayFieldProps<
  TFormData,
  TName extends keyof TFormData,
  TFormKeys extends readonly (keyof TFormData)[] = readonly (keyof TFormData)[],
  TItem = ArrayItem<TFormData[TName]>,
  TCtx = Pick<TFormData, TFormKeys[number]>,
> {
  name: TName & string;
  label?: React.ReactNode;
  form: AnyFormApi<TFormData>;
  disabled?: boolean;
  columns: ColumnConfig<TItem>[];
  FormItem?: ArrayFormItem<TItem, TCtx>;
  subscribeKeys?: TFormKeys;
  effects?: ArrayFieldSideEffect<TFormData, TItem, TCtx>;
  renderFormItem?: (ctx: {
    items: TItem[];
    onAdd: (item: TItem) => void;
    editData?: TItem;
    clearEditData: () => void;
    ctx?: TCtx;
  }) => React.ReactNode;
}

function GenericArrayField<
  TFormData,
  TName extends keyof TFormData,
  TFormKeys extends readonly (keyof TFormData)[],
>({
  name,
  label,
  form,
  effects,
  FormItem,
  columns,
  subscribeKeys,
  renderFormItem,
  disabled = false,
}: GenericArrayFieldProps<TFormData, TName, TFormKeys>) {
  const [editData, setEditData] = useState();
  const effectsAppliedRef = useRef<string>("");

  const entityName = name.replace(/s$/, "");

  return (
    <form.Subscribe
      selector={(state) => {
        const ctx = subscribeKeys?.reduce(
          (acc, key) => {
            acc[key] = state.values[key];
            return acc;
          },
          {} as Pick<TFormData, TFormKeys[number]>,
        );
        return { ctx, items: state.values[name] ?? [] };
      }}
    >
      {({ items, ctx }) => (
        <form.Field name={name} mode="array">
          {(field) => {
            const ArrItems = Array.isArray(items) ? items : [];

            if (effects) {
              const effectKey = JSON.stringify({ items: ArrItems, ctx });
              if (effectsAppliedRef.current !== effectKey) {
                effectsAppliedRef.current = effectKey;
                setTimeout(() => {
                  effects({ form, items: ArrItems, ctx });
                }, 0);
              }
            }

            const handleAdd = (item: any) => {
              field.pushValue(item);
              if (editData) setEditData(undefined);
            };
            const handleEdit = (i: number, item: any) => {
              setEditData(item);
              field.removeValue(i);
            };
            const handleRemove = (index: number) => field.removeValue(index);

            return (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {label ?? name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {renderFormItem
                      ? renderFormItem({
                          ctx,
                          items: ArrItems,
                          onAdd: handleAdd,
                          clearEditData: () => setEditData(undefined),
                        })
                      : FormItem && (
                          <FormItem
                            onSubmit={handleAdd}
                            disabled={disabled}
                            editData={editData}
                            items={ArrItems}
                            clearEditData={() => setEditData(undefined)}
                            ctx={ctx}
                          >
                            {(handleSubmit, handleCancel) => (
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  Total {entityName}: <b>{ArrItems.length}</b>
                                </p>

                                <div className="flex items-center gap-4">
                                  {editData ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={handleCancel}
                                    >
                                      Cancel edit
                                    </Button>
                                  ) : null}
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSubmit}
                                  >
                                    {`Add ${entityName}`}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </FormItem>
                        )}
                  </CardContent>
                </Card>

                {ArrItems.length > 0 && (
                  <Card className="p-0 pt-6 bg-input/30">
                    <div className="px-6 flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {entityName} History
                      </CardTitle>
                      <Badge variant="outline">{ArrItems.length} items</Badge>
                    </div>

                    <CardContent className="p-0">
                      <GenericFormTable
                        items={ArrItems}
                        columns={columns}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                        entityTitle={entityName}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            );
          }}
        </form.Field>
      )}
    </form.Subscribe>
  );
}

export default GenericArrayField;

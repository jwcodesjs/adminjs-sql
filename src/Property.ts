import { BaseProperty, type PropertyType } from "adminjs";

export type ColumnInfo = {
  name: string;
  isId: boolean;
  isEnum: boolean;
  position: number;
  defaultValue?: string | number | boolean;
  isNullable: boolean;
  isEditable: boolean;
  type: PropertyType;
  referencedTable: string | null;
  availableValues?: string[] | null;
};

export class Property extends BaseProperty {
  private readonly _isPrimary: boolean;

  private readonly _isNullable: boolean;

  private readonly _isEditable: boolean;

  private readonly _referencedTable: string | null;

  private readonly _name: string;

  private readonly _availableValues?: string[] | null;

  private readonly _isEnum: boolean;

  constructor(column: ColumnInfo) {
    const {
      name,
      isId,
      isEnum,
      position,
      isNullable,
      isEditable,
      type,
      referencedTable,
      availableValues,
    } = column;

    super({
      path: name,
      isId,
      position,
      type,
    });

    this._name = name;
    this._isPrimary = isId;
    this._isEnum = isEnum;
    this._isNullable = isNullable;
    this._isEditable = isEditable;
    this._referencedTable = referencedTable;
    this._availableValues = availableValues;
  }

  override isId(): boolean {
    return this._isPrimary;
  }

  override name(): string {
    return this._name;
  }

  override path(): string {
    return this._name;
  }

  override isEditable(): boolean {
    return this._isEditable && !this.isId();
  }

  override reference(): string | null {
    return this._referencedTable;
  }

  override availableValues(): Array<string> | null {
    if (this._availableValues) {
      return this._availableValues;
    }

    return null;
  }

  override subProperties(): BaseProperty[] {
    return [];
  }

  override isRequired(): boolean {
    return !this._isNullable;
  }

  public isEnum(): boolean {
    return this._isEnum;
  }
}

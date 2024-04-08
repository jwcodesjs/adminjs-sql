import { BaseProperty } from "adminjs";
export class Property extends BaseProperty {
    _isPrimary;
    _isNullable;
    _isEditable;
    _referencedTable;
    _name;
    _availableValues;
    _isEnum;
    constructor(column) {
        const { name, isId, isEnum, position, isNullable, isEditable, type, referencedTable, availableValues, } = column;
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
    isId() {
        return this._isPrimary;
    }
    name() {
        return this._name;
    }
    path() {
        return this._name;
    }
    isEditable() {
        return this._isEditable && !this.isId();
    }
    reference() {
        return this._referencedTable;
    }
    availableValues() {
        if (this._availableValues) {
            return this._availableValues;
        }
        return null;
    }
    subProperties() {
        return [];
    }
    isRequired() {
        return !this._isNullable;
    }
    isEnum() {
        return this._isEnum;
    }
}
//# sourceMappingURL=Property.js.map
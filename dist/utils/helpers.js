export const safeParseJSON = (json) => {
    try {
        return JSON.parse(json);
    }
    catch (_error) {
        return null;
    }
};
//# sourceMappingURL=helpers.js.map
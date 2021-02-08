const MODEL_IMPORTS = {
    softDeletes: "Illuminate\\Database\\Eloquent\\SoftDeletes;",
    useUUID: "App\\Concerns\\UsesUuid;",
    hasApiToken: "Laravel\\Passport\\HasApiTokens;",
    authenticatable: "Illuminate\\Foundation\\Auth\\User as Authenticatable;",
    notifiable: "Illuminate\\Notifications\\Notifiable;",
    hasMany: "Illuminate\\Database\\Eloquent\\Relations\\HasMany;",
    hasOne: "Illuminate\\Database\\Eloquent\\Relations\\HasOne;",
    belongsTo: "Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;",
    belongsToMany: "Illuminate\\Database\\Eloquent\\Relations\\BelongsToMany;",
}


module.exports = MODEL_IMPORTS;
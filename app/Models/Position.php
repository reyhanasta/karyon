<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Position extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function documentTypes(): BelongsToMany
    {
        return $this->belongsToMany(DocumentType::class)->withPivot('is_required')->withTimestamps();
    }

    public function scopeForSelect(Builder $query): Builder
    {
        return $query->orderBy('name')->select('id', 'name');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function documentTypes()
    {
        return $this->belongsToMany(DocumentType::class)->withPivot('is_required')->withTimestamps();
    }
}

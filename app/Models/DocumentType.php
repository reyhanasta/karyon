<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    public function employeeDocuments()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function positions()
    {
        return $this->belongsToMany(Position::class)->withPivot('is_required')->withTimestamps();
    }
}

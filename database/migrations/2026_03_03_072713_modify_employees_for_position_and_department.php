<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Drop old string-based columns and their indexes
            $table->dropIndex(['department']);
            $table->dropIndex(['position']);
            
            $table->dropColumn(['department', 'position']);

            // Add new foreign keys
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['position_id']);
            
            $table->dropColumn(['department_id', 'position_id']);
            
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            
            $table->index('department');
            $table->index('position');
        });
    }
};

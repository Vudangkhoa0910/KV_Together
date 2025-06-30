<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformFinancialSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'setting_key',
        'setting_value',
        'data_type',
        'description',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean'
    ];

    /**
     * Get the setting value with proper type casting
     */
    public function getTypedValueAttribute()
    {
        return match($this->data_type) {
            'decimal' => (float) $this->setting_value,
            'integer' => (int) $this->setting_value,
            'boolean' => filter_var($this->setting_value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($this->setting_value, true),
            'string' => $this->setting_value,
            default => $this->setting_value
        };
    }

    /**
     * Set the setting value
     */
    public function setTypedValue($value)
    {
        $this->setting_value = match($this->data_type) {
            'json' => json_encode($value),
            'boolean' => $value ? 'true' : 'false',
            default => (string) $value
        };
        
        return $this;
    }

    /**
     * Get a setting by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('setting_key', $key)->first();
        return $setting ? $setting->typed_value : $default;
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, $value, string $dataType = 'string'): self
    {
        $setting = static::firstOrNew(['setting_key' => $key]);
        $setting->data_type = $dataType;
        $setting->setTypedValue($value);
        $setting->save();
        
        return $setting;
    }

    /**
     * Get public settings only
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Get all public settings as key-value pairs
     */
    public static function getPublicSettings(): array
    {
        return static::public()
            ->get()
            ->pluck('typed_value', 'setting_key')
            ->toArray();
    }
}

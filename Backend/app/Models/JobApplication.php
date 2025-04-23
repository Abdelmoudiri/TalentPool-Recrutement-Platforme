<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'job_offer_id',
        'status',
        'cover_letter',
        'cv_path',
        'recruiter_notes', // Correction du nom de la colonne
        'last_status_change',
    ];
    
    /**
     * Alias pour recruiter_notes.
     * Pour maintenir la compatibilité avec le code existant.
     */
    public function getNotesAttribute()
    {
        return $this->recruiter_notes;
    }
    
    /**
     * Alias pour recruiter_notes.
     * Pour maintenir la compatibilité avec le code existant.
     */
    public function setNotesAttribute($value)
    {
        $this->attributes['recruiter_notes'] = $value;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_status_change' => 'datetime',
    ];

    /**
     * Get the candidate who submitted this application.
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    /**
     * Get the user who submitted this application.
     * This is an alias for candidate() for better backend/frontend compatibility.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the job offer this application is for.
     */
    public function jobOffer(): BelongsTo
    {
        return $this->belongsTo(JobOffer::class);
    }

    /**
     * Update the application status and track the change time.
     *
     * @param string $status
     * @return bool
     */
    public function updateStatus(string $status): bool
    {
        if (!in_array($status, ['pending', 'reviewing', 'accepted', 'rejected'])) {
            return false;
        }

        $this->status = $status;
        $this->last_status_change = now();
        return $this->save();
    }
}
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobOfferController;
use App\Http\Controllers\JobApplicationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Job Offers
    Route::prefix('job-offers')->group(function () {
        Route::get('/', [JobOfferController::class, 'index']);
        Route::post('/', [JobOfferController::class, 'store']);
        Route::get('/statistics', [JobOfferController::class, 'statistics']);
        Route::get('/{id}', [JobOfferController::class, 'show']);
        Route::put('/{id}', [JobOfferController::class, 'update']);
        Route::delete('/{id}', [JobOfferController::class, 'destroy']);
    });
    
    // Job Applications
    Route::prefix('applications')->group(function () {
        // Candidate routes
        Route::get('/my', [JobApplicationController::class, 'getMyApplications']);
        Route::post('/job/{jobOfferId}', [JobApplicationController::class, 'apply']);
        Route::delete('/{applicationId}', [JobApplicationController::class, 'withdraw']);
        
        // Recruiter routes
        Route::get('/job/{jobOfferId}', [JobApplicationController::class, 'getJobOfferApplications']);
        Route::put('/{applicationId}/status', [JobApplicationController::class, 'updateStatus']);
        
        // Common routes
        Route::get('/statistics', [JobApplicationController::class, 'statistics']);
        Route::get('/recent', [JobApplicationController::class, 'getRecentApplications']);
        
        // Simple temporary solution for application details
        Route::get('/{applicationId}', function ($applicationId) {
            try {
                // Récupérer directement des données brutes depuis la base de données
                // pour éviter les problèmes de modèle
                $application = DB::table('job_applications')->where('id', $applicationId)->first();
                
                if (!$application) {
                    return response()->json(['error' => 'Application not found'], 404);
                }
                
                // Récupérer les données reliées
                $jobOffer = DB::table('job_offers')->where('id', $application->job_offer_id)->first();
                $user = DB::table('users')->where('id', $application->user_id)->first();
                
                // Vérification simplifiée d'autorisation
                $currentUser = \Illuminate\Support\Facades\Auth::user();
                
                if (!$currentUser) {
                    return response()->json(['error' => 'User not authenticated'], 401);
                }
                
                // Vérifier les rôles sans appeler des méthodes personnalisées
                $isAdmin = $currentUser->role === 'admin';
                $isOwner = $currentUser->id == $application->user_id;
                $isRecruiter = $currentUser->role === 'recruiter' && $jobOffer && $currentUser->id == $jobOffer->user_id;
                
                if (!$isAdmin && !$isOwner && !$isRecruiter) {
                    return response()->json(['error' => 'Unauthorized access'], 403);
                }
                
                // Convertir les objets stdClass en arrays pour le JSON
                $applicationArray = json_decode(json_encode($application), true);
                
                // Construire manuellement la réponse
                $responseData = [
                    'id' => $application->id,
                    'user_id' => $application->user_id,
                    'job_offer_id' => $application->job_offer_id,
                    'status' => $application->status,
                    'cover_letter' => $application->cover_letter,
                    'cv_path' => $application->cv_path,
                    'notes' => $application->notes,
                    'created_at' => $application->created_at,
                    'updated_at' => $application->updated_at,
                    
                    // Ne pas utiliser les attributs qui pourraient ne pas exister
                    'last_status_change' => $application->last_status_change ?? null,
                    
                    // Add user/candidate data
                    'candidate' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email
                    ] : null,
                    
                    // Add job offer data
                    'job_offer' => $jobOffer ? [
                        'id' => $jobOffer->id,
                        'title' => $jobOffer->title,
                        'company_name' => $jobOffer->company_name ?? null,
                        'location' => $jobOffer->location ?? null,
                        'contract_type' => $jobOffer->contract_type ?? null,
                        'user_id' => $jobOffer->user_id
                    ] : null
                ];
                
                return response()->json($responseData);
            } catch (\Exception $e) {
                // Capture et journaliser l'erreur
                \Illuminate\Support\Facades\Log::error('Application details error: ' . $e->getMessage(), [
                    'exception' => $e,
                    'applicationId' => $applicationId
                ]);
                
                // Retourner les détails de l'erreur pour le débogage
                return response()->json([
                    'error' => 'Application details could not be retrieved',
                    'message' => $e->getMessage(),
                    'stack' => $e->getTraceAsString()
                ], 500);
            }
        });
    });
});

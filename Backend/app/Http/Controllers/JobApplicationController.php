<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\JobApplicationService;
use App\Services\JobOfferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Job Applications",
 *     description="API endpoints for job applications management"
 * )
 */
class JobApplicationController extends Controller
{
    protected $jobApplicationService;
    protected $jobOfferService;

    /**
     * Create a new controller instance.
     *
     * @param JobApplicationService $jobApplicationService
     * @param JobOfferService $jobOfferService
     */
    public function __construct(
        JobApplicationService $jobApplicationService,
        JobOfferService $jobOfferService
    ) {
        $this->jobApplicationService = $jobApplicationService;
        $this->jobOfferService = $jobOfferService;
        // Removed middleware call - authentication is handled in routes/api.php
    }

    /**
     * Get applications for a job offer (for recruiters).
     *
     * @param int $jobOfferId
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Get(
     *     path="/applications/job/{jobOfferId}",
     *     operationId="getJobOfferApplications",
     *     tags={"Job Applications"},
     *     summary="Get applications for a specific job offer",
     *     description="Returns all applications for a specific job offer (recruiters only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="jobOfferId",
     *         in="path",
     *         required=true,
     *         description="Job Offer ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="applications",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="job_offer_id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=3),
     *                     @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *                     @OA\Property(property="cv_path", type="string", example="applications/3/resume.pdf"),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="recruiter_notes", type="string", example="Good candidate, schedule interview"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized or job offer not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized or job offer not found")
     *         )
     *     )
     * )
     */
    public function getJobOfferApplications(int $jobOfferId): JsonResponse
    {
        $applications = $this->jobApplicationService->getApplicationsForJobOffer($jobOfferId);
        
        if (!$applications) {
            return response()->json(['error' => 'Unauthorized or job offer not found'], 403);
        }
        
        return response()->json($applications);
    }

    /**
     * Get applications for the authenticated candidate.
     *
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Get(
     *     path="/applications/my",
     *     operationId="getMyApplications",
     *     tags={"Job Applications"},
     *     summary="Get authenticated user's applications",
     *     description="Returns all applications made by the authenticated user (candidates only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="applications",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="job_offer_id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=3),
     *                     @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *                     @OA\Property(property="cv_path", type="string", example="applications/3/resume.pdf"),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="recruiter_notes", type="string", example="Good candidate, schedule interview"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized access",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized access")
     *         )
     *     )
     * )
     */
    public function getMyApplications(): JsonResponse
    {
        $applications = $this->jobApplicationService->getMyApplications();
        
        if (!$applications) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }
        
        return response()->json($applications);
    }

    /**
     * Apply for a job.
     *
     * @param Request $request
     * @param int $jobOfferId
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Post(
     *     path="/applications/job/{jobOfferId}",
     *     operationId="applyForJob",
     *     tags={"Job Applications"},
     *     summary="Apply for a job",
     *     description="Submit a job application for a specific job offer (candidates only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="jobOfferId",
     *         in="path",
     *         required=true,
     *         description="Job Offer ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *         ),
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *                 @OA\Property(property="cv", type="string", format="binary", description="CV file (PDF, DOC, DOCX) max 2MB")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Application submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Application submitted successfully"),
     *             @OA\Property(
     *                 property="application", 
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="job_offer_id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=3),
     *                 @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *                 @OA\Property(property="cv_path", type="string", example="applications/3/resume.pdf"),
     *                 @OA\Property(property="status", type="string", example="pending"),
     *                 @OA\Property(property="recruiter_notes", type="string", example="Good candidate, schedule interview"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Unable to apply",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unable to apply for this job. You may have already applied or the job offer is not active.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\AdditionalProperties(
     *                     type="array",
     *                     @OA\Items(type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function apply(Request $request, int $jobOfferId): JsonResponse
    {
        $request->validate([
            'cover_letter' => 'nullable|string|max:5000',
        ]);
        
        $cvFile = $request->file('cv');
        
        if ($cvFile) {
            $request->validate([
                'cv' => 'file|mimes:pdf,doc,docx|max:2048', // 2MB Max
            ]);
        }
        
        $application = $this->jobApplicationService->applyForJob(
            $jobOfferId,
            $request->only('cover_letter'),
            $cvFile
        );
        
        if (!$application) {
            return response()->json([
                'error' => 'Unable to apply for this job. You may have already applied or the job offer is not active.'
            ], 400);
        }
        
        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application
        ], 201);
    }

    /**
     * Withdraw an application.
     *
     * @param int $applicationId
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Delete(
     *     path="/applications/{applicationId}",
     *     operationId="withdrawApplication",
     *     tags={"Job Applications"},
     *     summary="Withdraw a job application",
     *     description="Withdraw a previously submitted job application (candidates only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="applicationId",
     *         in="path",
     *         required=true,
     *         description="Job Application ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Application withdrawn successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Application withdrawn successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized or application not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized or application not found")
     *         )
     *     )
     * )
     */
    public function withdraw(int $applicationId): JsonResponse
    {
        $withdrawn = $this->jobApplicationService->withdrawApplication($applicationId);
        
        if (!$withdrawn) {
            return response()->json(['error' => 'Unauthorized or application not found'], 403);
        }
        
        return response()->json(['message' => 'Application withdrawn successfully']);
    }

    /**
     * Update application status (for recruiters).
     *
     * @param Request $request
     * @param int $applicationId
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Put(
     *     path="/applications/{applicationId}/status",
     *     operationId="updateApplicationStatus",
     *     tags={"Job Applications"},
     *     summary="Update job application status",
     *     description="Update the status of a job application (recruiters only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="applicationId",
     *         in="path",
     *         required=true,
     *         description="Job Application ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="accepted", enum={"pending", "reviewing", "accepted", "rejected"}),
     *             @OA\Property(property="notes", type="string", example="Excellent candidate, schedule interview.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Application status updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Application status updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized or application not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized or application not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\AdditionalProperties(
     *                     type="array",
     *                     @OA\Items(type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function updateStatus(Request $request, int $applicationId): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,reviewing,accepted,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        $updated = $this->jobApplicationService->updateApplicationStatus(
            $applicationId,
            $request->status,
            $request->notes
        );
        
        if (!$updated) {
            return response()->json(['error' => 'Unauthorized or application not found'], 403);
        }
        
        return response()->json(['message' => 'Application status updated successfully']);
    }

    /**
     * Get a specific application details.
     *
     * @param int $applicationId
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Get(
     *     path="/applications/{applicationId}",
     *     operationId="getApplicationById",
     *     tags={"Job Applications"},
     *     summary="Get job application information",
     *     description="Returns job application data (candidate who applied or recruiter for that job only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="applicationId",
     *         in="path",
     *         required=true,
     *         description="Job Application ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="application", 
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="job_offer_id", type="integer", example=1),
     *                 @OA\Property(property="user_id", type="integer", example=3),
     *                 @OA\Property(property="cover_letter", type="string", example="I am interested in this position because..."),
     *                 @OA\Property(property="cv_path", type="string", example="applications/3/resume.pdf"),
     *                 @OA\Property(property="status", type="string", example="pending"),
     *                 @OA\Property(property="recruiter_notes", type="string", example="Good candidate, schedule interview"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized or application not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized or application not found")
     *         )
     *     )
     * )
     */
    public function show(int $applicationId): JsonResponse
    {
        try {
            // Utiliser la méthode directe avec DB Query Builder au lieu des relations Eloquent
            $application = \Illuminate\Support\Facades\DB::table('job_applications')
                ->where('id', $applicationId)
                ->first();
            
            if (!$application) {
                return response()->json(['error' => 'Application not found'], 404);
            }
            
            // Récupérer les données reliées sans utiliser les relations Eloquent
            $jobOffer = \Illuminate\Support\Facades\DB::table('job_offers')
                ->where('id', $application->job_offer_id)
                ->first();
                
            $user = \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $application->user_id)
                ->first();
            
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
            
            // Construire manuellement la réponse
            $responseData = [
                'id' => $application->id,
                'user_id' => $application->user_id,
                'job_offer_id' => $application->job_offer_id,
                'status' => $application->status,
                'cover_letter' => $application->cover_letter,
                'cv_path' => $application->cv_path,
                'notes' => $application->recruiter_notes ?? null,
                'created_at' => $application->created_at,
                'updated_at' => $application->updated_at,
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
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Get statistics related to applications.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Get(
     *     path="/applications/statistics",
     *     operationId="getApplicationStatistics",
     *     tags={"Job Applications"},
     *     summary="Get job application statistics",
     *     description="Returns statistics about job applications based on user role",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="statistics",
     *                 type="object",
     *                 @OA\Property(property="total_applications", type="integer", example=25),
     *                 @OA\Property(property="pending_applications", type="integer", example=10),
     *                 @OA\Property(property="reviewing_applications", type="integer", example=5),
     *                 @OA\Property(property="accepted_applications", type="integer", example=7),
     *                 @OA\Property(property="rejected_applications", type="integer", example=3)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid user role or could not retrieve statistics",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Invalid user role")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized access",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized access")
     *         )
     *     )
     * )
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = Auth::user();
        $type = null;
        
        if ($user->isAdmin()) {
            $type = 'admin';
        } elseif ($user->isRecruiter()) {
            $type = 'recruiter';
        } elseif ($user->isCandidate()) {
            $type = 'candidate';
        }
        
        if (!$type) {
            return response()->json(['error' => 'Invalid user role'], 400);
        }
        
        $statistics = $this->jobApplicationService->getStatistics($type);
        
        if (empty($statistics)) {
            return response()->json(['error' => 'Could not retrieve statistics'], 400);
        }
        
        return response()->json(['statistics' => $statistics]);
    }
    
    /**
     * Get recent job applications.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * @OA\Get(
     *     path="/applications/recent",
     *     operationId="getRecentApplications",
     *     tags={"Job Applications"},
     *     summary="Get recent job applications",
     *     description="Returns recent job applications for dashboard display (recruiters and admins only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         required=false,
     *         description="Maximum number of applications to return",
     *         @OA\Schema(type="integer", default=5)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="applications",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="job_offer_id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=3),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(
     *                         property="job_offer",
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="title", type="string", example="Senior PHP Developer")
     *                     ),
     *                     @OA\Property(
     *                         property="user",
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=3),
     *                         @OA\Property(property="name", type="string", example="John Doe")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized access",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Unauthorized access")
     *         )
     *     )
     * )
     */
    public function getRecentApplications(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $user = Auth::user();
        
        // Vérifier si l'utilisateur est authentifié
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        try {
            // Option 1: Utiliser le service existant pour les recruteurs
            $applications = $this->jobApplicationService->getRecentApplications((int)$limit);
            
            // Option 2: Si l'utilisateur est un administrateur, récupérer toutes les candidatures 
            // même si le service renvoie null
            if ($applications === null && $user->role === 'admin') {
                // Requête directe pour les administrateurs
                $applications = JobApplication::with(['user', 'jobOffer'])
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
            }
            
            if ($applications === null) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }
            
            return response()->json(['applications' => $applications]);
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching recent applications: ' . $e->getMessage());
            return response()->json([
                'error' => 'Could not retrieve applications',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
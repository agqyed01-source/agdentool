import React, { useEffect, useState, useRef } from 'react';
import { Star, UploadCloud, X, Loader2, CheckCircle } from 'lucide-react';
import { wooApi, WooReview } from '../services/woo';

export const ProductReviews = ({ productId, initialCount, averageRating }: { productId: number; initialCount: number; averageRating: string }) => {
  const [reviews, setReviews] = useState<WooReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    wooApi.getProductReviews(productId).then(data => {
      setReviews(data);
      setLoading(false);
    });

    // Check for logged in user to prepopulate fields
    wooApi.getCurrentUser().then(user => {
      if (user) {
        setIsLoggedIn(true);
        setReviewerName(user.first_name || user.username || '');
        setReviewerEmail(user.email || '');
      }
    });
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...filesArray].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText || !reviewerName || !reviewerEmail) return;
    
    setSubmitStatus('loading');
    
    const formData = new FormData();
    formData.append('rating', rating.toString());
    formData.append('review_text', reviewText);
    formData.append('comment', reviewText); // fallback field name
    formData.append('reviewer_name', reviewerName);
    formData.append('author', reviewerName); // fallback field name
    formData.append('reviewer_email', reviewerEmail);
    formData.append('email', reviewerEmail); // fallback field name
    formData.append('title', reviewText.substring(0, 20) + '...');
    formData.append('wcpr_rating', rating.toString());
    formData.append('wcpr_gdpr_checkbox', 'on');
    formData.append('vi_comment_post_ID', productId.toString()); // often required by villa theme plugins
    
    // For WooCommerce Photo Review by VillaTheme
    selectedImages.forEach((file) => {
      // Use the standard array field name that the plugin expects
      formData.append('wcpr_image_upload[]', file);
    });

    try {
      await wooApi.submitReview(productId, formData);
      setSubmitStatus('success');
      // Optimistically reload reviews
      const updatedReviews = await wooApi.getProductReviews(productId);
      setReviews(updatedReviews);
      
      // reset form
      setReviewText('');
      if (!isLoggedIn) {
        setReviewerName('');
        setReviewerEmail('');
      }
      setRating(5);
      setSelectedImages([]);
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitError(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="px-2">
      <div className="flex flex-col md:flex-row gap-12 mb-12">
        <div className="flex flex-col items-center justify-start p-8 bg-slate-50 rounded-2xl min-w-[200px] border border-slate-100">
          <span className="text-5xl font-black text-slate-900 mb-2">{averageRating}</span>
          <div className="flex text-yellow-400 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={20} fill={i <= parseFloat(averageRating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={i <= parseFloat(averageRating) ? 0 : 1} />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-500">Based on {reviews.length > 0 ? reviews.length : initialCount} reviews</span>
        </div>
        
        <div className="flex-1">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Real Reviews from Dental Professionals</h3>
           
           <div className="space-y-6 mb-12">
              {loading ? (
                <div className="text-slate-500 flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <p className="text-slate-500">No reviews yet. Be the first to review this product.</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-slate-100 pb-6">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="flex text-yellow-400">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} stroke={i <= review.rating ? "none" : "currentColor"} />
                          ))}
                       </div>
                       <span className="font-bold text-slate-900 text-sm">{review.reviewer}</span>
                       {review.verified && <span className="text-brand-primary text-xs flex items-center gap-1"><CheckCircle size={12}/> Verified</span>}
                     </div>
                     <div className="prose prose-sm text-slate-600 mb-3" dangerouslySetInnerHTML={{ __html: review.review }} />
                     
                     {/* Photo Review Images if any */}
                     {review.images && review.images.length > 0 && (
                       <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                         {review.images.map((img, idx) => (
                           <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                             <img src={img} alt="Review" className="w-full h-full object-cover" />
                           </a>
                         ))}
                       </div>
                     )}
                     <span className="text-slate-400 text-xs font-medium">{new Date(review.date_created).toLocaleDateString()}</span>
                  </div>
                ))
              )}
           </div>

           {/* Write Review Form */}
           <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-lg text-slate-900 mb-4">Write a Review</h4>
              
              {submitStatus === 'success' ? (
                 <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center text-center py-8">
                   <CheckCircle className="mb-2" size={32} />
                   <p className="font-bold">Thank you for your review!</p>
                   <p className="text-sm mt-1">Your feedback helps clinics make better choices.</p>
                   <button onClick={() => setSubmitStatus('idle')} className="mt-4 text-sm font-medium underline">Write another review</button>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{submitError}</div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          type="button"
                          className="text-yellow-400 focus:outline-none"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star 
                            size={24} 
                            fill={(hoverRating || rating) >= star ? "currentColor" : "none"} 
                            stroke="currentColor" 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Your Review</label>
                    <textarea 
                      required
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-brand-primary min-h-[100px]"
                      placeholder="What did you like or dislike? How's the quality?"
                    />
                  </div>

                  {!isLoggedIn && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                        <input 
                          type="text" required
                          value={reviewerName}
                          onChange={e => setReviewerName(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-brand-primary"
                          placeholder="Dr. Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input 
                          type="email" required
                          value={reviewerEmail}
                          onChange={e => setReviewerEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-brand-primary"
                          placeholder="smith@clinic.com"
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Upload for VillaTheme Photo Reviews */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Photos</label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                       <UploadCloud size={32} className="text-slate-400 mb-2" />
                       <span className="text-sm font-bold text-slate-700">Click to upload images</span>
                       <span className="text-xs text-slate-500 mt-1">Up to 5 images (JPG, PNG)</span>
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef} 
                         accept="image/png, image/jpeg, image/jpg"
                         multiple
                         onChange={handleImageChange}
                       />
                    </div>
                    
                    {selectedImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {selectedImages.map((file, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                              className="absolute top-0 right-0 bg-white/80 p-0.5 rounded-bl-lg text-red-600 hover:text-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-slate-900 text-white font-bold text-sm rounded-lg py-3 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:bg-slate-400"
                  >
                    {submitStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
                    Submit Clinic Review
                  </button>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

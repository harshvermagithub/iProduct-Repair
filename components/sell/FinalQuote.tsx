
import { CheckCircle, Truck, Wallet, Loader2, MapPin, Calendar, Clock, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from 'react';
import { placeOrder } from '@/actions/orders';
import { calculatePrice } from '@/actions/priceCalculation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic Import for Map (Client Only)
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

interface FinalQuoteProps {
    basePrice: number;
    answers: Record<string, unknown>;
    deviceInfo: { name: string; variant: string };
    isRepair?: boolean;
    user?: any;
    category?: string;
    onRecalculate?: () => void;
    initialPincode?: string;
}

type BookingStep = 'contact' | 'quote' | 'address' | 'schedule';

export default function FinalQuote({ basePrice, answers, deviceInfo, isRepair, user, category, onRecalculate, initialPincode }: FinalQuoteProps) {
    // If repair, start at address. Else if user logged in, skip contact and go to quote. Else contact.
    const [bookingStep, setBookingStep] = useState<BookingStep>(
        isRepair ? 'address' : (user ? 'quote' : 'contact')
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [pincode, setPincode] = useState(initialPincode || '');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState<number>(0); // 0 to 3 index
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [isExpress, setIsExpress] = useState(false);

    // UI States
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');
    // State for detected address preview
    const [detectedAddress, setDetectedAddress] = useState('');

    const router = useRouter();

    // -------------------------------------------------------------------------
    // PRICE CALCULATION LOGIC
    // -------------------------------------------------------------------------
    const [finalPrice, setFinalPrice] = useState(0);
    const [isCalculating, setIsCalculating] = useState(true);

    useEffect(() => {
        setIsCalculating(true);
        calculatePrice(basePrice, answers, category || 'smartphone')
            .then(price => {
                setFinalPrice(price);
                setIsCalculating(false);
            })
            .catch(err => {
                console.error(err);
                setIsCalculating(false);
            });
    }, [basePrice, answers, category]);

    // -------------------------------------------------------------------------
    // DATE GENERATION (Dynamic based on time)
    // -------------------------------------------------------------------------

    // Helper to check availability
    const now = new Date();
    const currentHour = now.getHours();

    // If past 4 PM, start dates from Tomorrow
    const startDayOffset = currentHour >= 16 ? 1 : 0;

    const dates = Array.from({ length: 4 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + startDayOffset);
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            fullDate: d.toISOString(),
            isToday: (d.getDate() === now.getDate() && d.getMonth() === now.getMonth())
        };
    });

    const timeSlots = [
        "10:00 AM - 02:00 PM",
        "03:00 PM - 07:00 PM"
    ];

    // Filter time slots based on selection
    const availableSlots = timeSlots.filter(slot => {
        // If selected date is NOT today, all slots available
        if (!dates[selectedDate]?.isToday) return true;

        // If Today, check cutoffs
        if (slot.startsWith("10:00")) {
            // "10:00 AM - 02:00 PM": Hide after 11 AM
            return currentHour < 11;
        }
        if (slot.startsWith("03:00")) {
            // "03:00 PM - 07:00 PM": Hide after 4 PM
            return currentHour < 16;
        }
        return true;
    });

    // Express Availability: Only if today is available (so < 4 PM)
    // Actually, simply hide if currentHour >= 16.
    const showExpress = currentHour < 16;


    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setDetectedAddress(data.display_name);
                // Optionally autofill main address if empty? User asked for separate preview box.
                if (!address) setAddress(data.display_name);

                // Auto-fill pincode if available and not manually set
                if (data.address && data.address.postcode && !pincode) {
                    setPincode(data.address.postcode);
                }
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
        }
    };

    const handleGetLocation = () => {
        setIsGettingLocation(true);
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported');
            setIsGettingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setLocation({ lat, lng });
                await fetchAddress(lat, lng);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error(error);
                let msg = 'Location failed.';
                if (error.code === 1) msg = 'Permission denied. Please allow location access.';
                else if (error.code === 2) msg = 'Location unavailable. Try again.';
                else if (error.code === 3) msg = 'Location request timed out.';

                setLocationError(msg);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleMapLocationChange = async (lat: number, lng: number) => {
        setLocation({ lat, lng });
        // Optional: Update address on drag end?
        // User said "User scan actually pinpoint their location".
        // Updating address is good UX.
        await fetchAddress(lat, lng);
    };

    const handleConfirmOrder = async () => {
        setIsSubmitting(true);
        try {
            const finalAnswers = {
                ...answers,
                phone,
                scheduledDate: dates[selectedDate].fullDate,
                scheduledSlot: selectedSlot,
                isExpress,
                detectedAddress
            };

            await placeOrder(deviceInfo.name, deviceInfo.variant, finalPrice, address, pincode, location, finalAnswers);
            router.push('/orders');
        } catch {
            // Backup redirect flow if placeOrder fails (e.g. auth)
            router.push('/login');
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------------------------------------------------------------------------
    // RENDER: STEP 0 - PINCODE POPUP (Only for Screen Guard if missing)
    // -------------------------------------------------------------------------
    if (bookingStep === 'address' && !pincode && !isSubmitting) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto py-12 space-y-8"
            >
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => {
                            if (isRepair || category === 'unbreakable-screenguard') {
                                if (onRecalculate) onRecalculate();
                            } else {
                                setBookingStep('quote');
                            }
                        }} 
                        className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Check Serviceability</h2>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Enter your pincode to check if we serve your area.</p>
                </div>
                <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Your Pincode</label>
                        <input
                            type="text"
                            maxLength={6}
                            className="w-full p-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary/50 outline-none tracking-widest text-lg"
                            placeholder="e.g. 560032"
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length === 6) {
                                    setPincode(val);
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <button
                        disabled
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Please enter 6-digit pincode
                    </button>
                </div>
            </motion.div>
        );
    }


    // -------------------------------------------------------------------------
    // RENDER: STEP 1 - CONTACT
    // -------------------------------------------------------------------------
    if (bookingStep === 'contact') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto py-12 space-y-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Almost there!</h2>
                    <p className="text-muted-foreground">Enter your number to unlock your device value.</p>
                </div>

                <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Number</label>
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center px-4 bg-muted rounded-xl border font-mono text-muted-foreground">
                                +91
                            </div>
                            <input
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 p-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary/50 outline-none text-lg tracking-widest"
                                placeholder="98765 43210"
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setBookingStep('quote')}
                        disabled={phone.length < 10}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        See Best Price <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-xs text-center text-muted-foreground">
                        We respect your privacy. No spam guaranteed.
                    </p>
                </div>
            </motion.div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: STEP 2 - QUOTE
    // -------------------------------------------------------------------------
    if (bookingStep === 'quote') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto py-10 space-y-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Best Price for your {deviceInfo.name}</h2>
                    <p className="text-muted-foreground">Based on your condition report</p>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-accent/50 p-10 rounded-[2.5rem] border border-primary/20 text-center space-y-4 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10" />

                    <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/10 dark:bg-white/10 text-primary-dark font-bold text-sm tracking-widest uppercase mb-2">
                        Your Final Offer
                    </div>
                    <div className="text-7xl font-black text-foreground tracking-tight flex items-center justify-center gap-2">
                        {isCalculating ? <Loader2 className="w-16 h-16 animate-spin text-primary" /> : `₹${finalPrice.toLocaleString()}`}
                    </div>
                    <p className="text-sm font-medium bg-slate-900 text-white inline-block px-4 py-1.5 rounded-full shadow-md">
                        Price valid for 3 days
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setBookingStep('address')}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold text-xl rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        Book Free Pickup <Truck className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => onRecalculate ? onRecalculate() : router.back()}
                        className="w-full py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        Recalculate Value
                    </button>
                </div>
            </motion.div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: STEP 3 - ADDRESS
    // -------------------------------------------------------------------------
    if (bookingStep === 'address') {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="max-w-xl mx-auto py-8 space-y-6"
            >
                <div className="flex items-center gap-4 mb-4">
                    <button 
                        onClick={() => {
                            if (isRepair || category === 'unbreakable-screenguard') {
                                if (onRecalculate) onRecalculate();
                            } else {
                                setBookingStep('quote');
                            }
                        }} 
                        className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">{isRepair ? 'Service Location' : 'Pickup Location'}</h2>
                </div>

                <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-sm">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium">{isRepair ? 'Address' : 'Pickup Address'}</label>
                        <textarea
                            className="w-full p-4 border rounded-xl bg-background min-h-[120px] focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            placeholder="House No, Street Area, Landmark, City, Pincode..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            autoFocus
                        />
                    </div>



                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 border-t border-dashed border-gray-300"></div>
                        <span className="text-muted-foreground font-medium text-xs uppercase">OR</span>
                        <div className="flex-1 border-t border-dashed border-gray-300"></div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium">Pin Location</label>
                        <button
                            onClick={handleGetLocation}
                            type="button"
                            className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group ${location
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-primary/30 hover:border-primary hover:bg-primary/5'
                                }`}
                        >
                            {isGettingLocation ? (
                                <><Loader2 className="animate-spin w-5 h-5" /> Detecting location...</>
                            ) : location ? (
                                <><CheckCircle className="w-5 h-5 fill-green-200" /> Location Captured</>
                            ) : (
                                <><MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" /> Detect My Location</>
                            )}
                        </button>
                        {locationError && <p className="text-destructive text-sm text-center">{locationError}</p>}

                        {/* Map Preview Logic */}
                        <AnimatePresence>
                            {location && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden space-y-2 pt-2"
                                >
                                    <div className="p-3 bg-muted/50 rounded-lg border text-sm text-muted-foreground flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                                        <div>
                                            <span className="font-semibold block text-foreground">Detected Location:</span>
                                            {detectedAddress || "Fetching address..."}
                                        </div>
                                    </div>

                                    {/* Interactive Map */}
                                    <div className="border rounded-xl overflow-hidden shadow-sm">
                                        <MapPicker
                                            center={location}
                                            onLocationChange={handleMapLocationChange}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/50">
                        <label className="block text-sm font-medium">Pincode (Required)</label>
                        <input
                            type="text"
                            maxLength={6}
                            className="w-full p-4 border rounded-xl bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="e.g. 560032"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setBookingStep('schedule')}
                    disabled={(!address && !location) || pincode.length !== 6} // Either Address OR Location is required, AND Pincode is required
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Continue to Schedule <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: STEP 4 - SCHEDULE
    // -------------------------------------------------------------------------
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="max-w-xl mx-auto py-8 space-y-6"
        >
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setBookingStep('address')} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{isRepair ? 'Schedule Visit' : 'Schedule Pickup'}</h2>
            </div>

            <div className="space-y-6">

                {/* Date Selection */}
                <div className={`space-y-3 transition-opacity ${isExpress ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Select Date
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {dates.map((d, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setSelectedDate(i);
                                    setIsExpress(false);
                                }}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${selectedDate === i
                                    ? 'border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                                    : 'border-border bg-card hover:bg-accent'
                                    }`}
                            >
                                <span className="text-xs opacity-80">{d.day}</span>
                                <span className="text-lg font-bold">{d.date}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slot Selection */}
                <div className={`space-y-3 transition-opacity ${isExpress ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Select Time Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableSlots.length > 0 ? availableSlots.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => {
                                    setSelectedSlot(slot);
                                    setIsExpress(false);
                                }}
                                className={`p-4 rounded-xl border text-sm font-semibold transition-all ${selectedSlot === slot
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                    : 'border-border bg-card hover:bg-accent'
                                    }`}
                            >
                                {slot}
                            </button>
                        )) : (
                            <p className="text-sm text-muted-foreground col-span-2 text-center py-4 bg-muted/20 rounded-xl">
                                No slots available for this date.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 border-t border-dashed border-gray-300"></div>
                    <span className="text-muted-foreground font-medium text-xs uppercase">OR</span>
                    <div className="flex-1 border-t border-dashed border-gray-300"></div>
                </div>

                {/* Express Pickup Option */}
                <div
                    className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${!showExpress ? 'border-dashed border-slate-200 bg-slate-50 opacity-80 cursor-not-allowed' :
                        isExpress ? 'border-amber-400 bg-amber-50 shadow-md transform scale-[1.02] cursor-pointer' :
                            'border-border bg-card hover:border-amber-200 opacity-90 cursor-pointer'
                        }`}
                    onClick={() => {
                        if (!showExpress) return;
                        const newState = !isExpress;
                        setIsExpress(newState);
                        if (newState) setSelectedSlot('');
                    }}
                >
                    {isExpress && <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-1 rounded-bl-xl">SELECTED</div>}
                    {!showExpress && <div className="absolute top-0 right-0 bg-slate-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">UNAVAILABLE</div>}

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExpress ? 'bg-amber-100 text-amber-600' : !showExpress ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className={`font-bold ${isExpress ? 'text-slate-900' : !showExpress ? 'text-muted-foreground' : 'text-foreground'}`}>{isRepair ? 'Express Service' : 'Express Pickup'}</h4>
                                {!showExpress ? (
                                    <span className="text-xs font-bold text-slate-400">CLOSED</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${isExpress ? 'text-slate-500' : 'text-muted-foreground'} line-through`}>₹50</span>
                                        <span className="text-sm font-bold text-green-600">FREE</span>
                                    </div>
                                )}
                            </div>
                            <p className={`text-xs mt-0.5 ${isExpress ? 'text-slate-600' : 'text-muted-foreground'}`}>
                                {!showExpress ? "Orders after 4 PM not valid for today." : (isRepair ? 'Service within 3 hours' : "Pickup within 3 hours")}
                            </p>
                            {!showExpress && <p className="text-[10px] font-medium text-amber-600 mt-1">Pickup shift ends at 7 PM.</p>}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isExpress ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                            {isExpress && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting || (!selectedSlot && !isExpress)}
                className="w-full py-4 text-xl font-bold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (isRepair ? 'Confirm Booking' : 'Confirm Pickup')}
            </button>
            <p className="text-center text-xs text-muted-foreground pb-8">
                By confirming, you agree to our Terms of Service
            </p>
        </motion.div>
    );
}

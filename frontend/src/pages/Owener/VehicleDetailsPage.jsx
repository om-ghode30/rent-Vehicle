import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addVehicleDetails } from '../../api/api';
import Navbar from "../../components/Navbar";

export default function VehicleDetailsPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        brand: '',
        model_name: '',
        vehicle_number: '',
        price_per_day: ''
    });

    const [rc, setRc] = useState(null);
    const [insurance, setInsurance] = useState(null);
    const [puc, setPuc] = useState(null);
    const [noc, setNoc] = useState(null);
    const [images, setImages] = useState([]); 
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImages = (e) => setImages(Array.from(e.target.files || []));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.brand || !form.model_name || !form.vehicle_number || !form.price_per_day) {
            alert('Please fill all required fields');
            return;
        }

        if (!rc || !insurance || !puc || !noc) {
            alert('Please upload RC, Insurance, PUC and NOC documents');
            return;
        }

        if (images.length !== 5) {
            alert('Please upload exactly 5 vehicle images');
            return;
        }

        const data = new FormData();
        data.append('brand', form.brand);
        data.append('model_name', form.model_name);
        data.append('vehicle_number', form.vehicle_number);
        data.append('price_per_day', form.price_per_day);

        data.append('rc', rc);
        data.append('insurance', insurance);
        data.append('puc', puc);
        data.append('noc', noc);

        images.forEach((file) => data.append('images', file));

        setLoading(true);
        try {
            const res = await addVehicleDetails(data);
            if (res.data && res.data.success) {
                alert(res.data.message || 'Vehicle added.');
                navigate('/owner/vehicles');
            } else {
                alert(res.data?.message || 'Unexpected response from server');
            }
        } catch (err) {
            console.error('Add vehicle failed', err);
            alert(err?.response?.data?.message || err.message || 'Failed to add vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b"> */}
                <Navbar />
            {/* </div> */}

            <div className="p-4 md:p-10 flex justify-center">
                <form 
                    onSubmit={handleSubmit} 
                    className="bg-white shadow-2xl shadow-slate-200 rounded-3xl p-6 md:p-10 w-full max-w-4xl border border-slate-100"
                >
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            Register <span className="text-blue-600">New Vehicle</span>
                        </h2>
                        <p className="text-slate-500 mt-2">Fill in the details below to list your vehicle for rent.</p>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">1</span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input name="brand" placeholder="Brand (e.g. Toyota)" value={form.brand} onChange={handleChange} required className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 transition-all" />
                            <input name="model_name" placeholder="Model (e.g. Camry)" value={form.model_name} onChange={handleChange} required className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 transition-all" />
                            <input name="vehicle_number" placeholder="Vehicle Number (e.g. MH12AB1234)" value={form.vehicle_number} onChange={handleChange} required className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 transition-all" />
                            <input name="price_per_day" type="number" placeholder="Price Per Day (₹)" value={form.price_per_day} onChange={handleChange} required className="w-full border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 transition-all" />
                        </div>
                    </div>

                    {/* Section 2: Documents */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">2</span>
                            Legal Documents (Images Only)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { label: 'RC Document', setter: setRc },
                                { label: 'Insurance Document', setter: setInsurance },
                                { label: 'PUC Document', setter: setPuc },
                                { label: 'NOC Certificate', setter: setNoc }
                            ].map((doc, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-700 mb-2 ml-1">{doc.label}</label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => doc.setter(e.target.files[0])} 
                                        required 
                                        className="text-sm border border-slate-200 p-3 rounded-xl bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Visuals */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">3</span>
                                Vehicle Photos
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${images.length === 5 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {images.length} / 5 Selected
                            </span>
                        </div>
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center">
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleImages} 
                                required 
                                className="text-sm w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" 
                            />
                            <p className="text-xs text-slate-400 mt-3 font-medium italic">Please upload exactly 5 high-quality images of the vehicle.</p>
                        </div>
                    </div>

                    <button 
                        disabled={loading} 
                        className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Processing Registration...
                            </span>
                        ) : 'Register Vehicle Now'}
                    </button>
                </form>
            </div>
        </div>
    );
}
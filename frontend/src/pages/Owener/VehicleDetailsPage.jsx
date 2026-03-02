import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addVehicleDetails } from '../../api/api';

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
	const [images, setImages] = useState([]); // expect 5 images
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleImages = (e) => setImages(Array.from(e.target.files || []));

	const handleSubmit = async (e) => {
		e.preventDefault();

		// basic validation matching backend requirements
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
		<div className="min-h-screen bg-gray-100 p-8 flex justify-center">
			<form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
				<h2 className="text-2xl font-bold mb-6 text-center">Enter Vehicle Details</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required className="border p-3 rounded-lg" />
					<input name="model_name" placeholder="Model" value={form.model_name} onChange={handleChange} required className="border p-3 rounded-lg" />
					<input name="vehicle_number" placeholder="Vehicle Number" value={form.vehicle_number} onChange={handleChange} required className="border p-3 rounded-lg" />
					<input name="price_per_day" type="number" placeholder="Price Per Day (₹)" value={form.price_per_day} onChange={handleChange} required className="border p-3 rounded-lg" />

					<div className="flex flex-col">
						<label className="text-xs font-bold mb-1">RC Document</label>
						<input type="file" accept="image/*" onChange={(e) => setRc(e.target.files[0])} required className="text-sm border p-2 rounded-lg bg-gray-50" />
					</div>

					<div className="flex flex-col">
						<label className="text-xs font-bold mb-1">Insurance Document</label>
						<input type="file" accept="image/*" onChange={(e) => setInsurance(e.target.files[0])} required className="text-sm border p-2 rounded-lg bg-gray-50" />
					</div>

					<div className="flex flex-col">
						<label className="text-xs font-bold mb-1">PUC Document</label>
						<input type="file" accept="image/*" onChange={(e) => setPuc(e.target.files[0])} required className="text-sm border p-2 rounded-lg bg-gray-50" />
					</div>

					<div className="flex flex-col">
						<label className="text-xs font-bold mb-1">NOC Certificate</label>
						<input type="file" accept="image/*" onChange={(e) => setNoc(e.target.files[0])} required className="text-sm border p-2 rounded-lg bg-gray-50" />
					</div>

					<div className="md:col-span-2">
						<label className="text-xs font-bold mb-1 block">Vehicle Images (exactly 5)</label>
						<input type="file" accept="image/*" multiple onChange={handleImages} required className="text-sm border p-2 rounded-lg bg-gray-50 w-full" />
					</div>
				</div>

				<button disabled={loading} className={`w-full mt-8 py-4 rounded-xl text-white font-bold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
					{loading ? 'Registering...' : 'Submit Vehicle'}
				</button>
			</form>
		</div>
	);
}
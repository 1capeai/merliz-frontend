"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  Home,
  CheckCircle,
  Download,
  Printer,
  Car,
  CreditCard,
  MapPin,
  Share2,
  Building2,
  X
} from "lucide-react";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tempCustomerData, setTempCustomerData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(`https://backend-2tr2.onrender.com/api/invoices/${id}`, { headers });
        setInvoice(data.invoice || data);
        setLoading(false);

        // Check for "N/A" in customer data or delivery address
        const customerHasNA = Object.values(data.invoice.customer).includes("N/A");
        const addressHasNA = Object.values(data.invoice.delivery.address).includes("N/A");
        if (customerHasNA || addressHasNA) {
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice details.");
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleDownload = () => {
    setShowModal(false); // Hide modal before downloading
    html2canvas(invoiceRef.current, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [canvas.width, canvas.height],
        compress: true
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("invoice.pdf");
      setShowModal(true); // Show modal again after downloading
    });
  };

  const handlePrint = () => {
    setShowModal(false); // Hide modal before printing
    window.print();
    setShowModal(true); // Show modal again after printing
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Construct the message
        const addressParts = [
          address.street,
          address.city,
          address.country,
          address.postalCode
        ].filter(part => part && part !== "N/A");
  
        const message = `
  #${invoice.invoiceNumber}
  
  ${invoice.items.map((item, index) => (
    `${item.quantity}x ${item.name} R ${item.total.toFixed(2)}`
  )).join('\n')}
  
  Item total: R ${invoice.pricing.subtotal.toFixed(2)} (Qty: ${invoice.items.reduce((total, item) => total + item.quantity, 0)})
  Total: R ${invoice.pricing.total.toFixed(2)}
  
  Customer: ${customer.name} ${customer.phone} ${customer.email}
  
  Service: Delivery
  └ ${addressParts.join(', ')}
  
  See invoice: ${window.location.href}
        `.trim();
  
        await navigator.share({
          title: "Invoice",
          text: message
        });
        console.log("Shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Web Share API is not supported in your browser.");
    }
  };
  
  
  
  

  const handleWhatsAppShare = async () => {
    try {
      // Construct the WhatsApp message using the provided template
      const message = `
  #${invoice.invoiceNumber}
  
  ${invoice.items.map((item, index) => (
    `${item.quantity}x ${item.name} R ${item.total.toFixed(2)}`
  )).join('\n')}
  
  Item total: R ${invoice.pricing.subtotal.toFixed(2)} (Qty: ${invoice.items.reduce((total, item) => total + item.quantity, 0)})
  Total: R ${invoice.pricing.total.toFixed(2)}
  
  Customer: ${customer.name} ${customer.phone} ${customer.email}
  
  Service: Delivery
  └ ${address.street}, ${address.city}, ${address.country} ${address.postalCode}
  
  See invoice https://backend-2tr2.onrender.com/orders/cm71mrgfl000113f0zmaj36ex
      `.trim();
  
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
  
      // Open WhatsApp with the constructed message
      window.open(whatsappURL, "_blank");
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
    }
  };
  

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setTempCustomerData({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: {
        street: data.street,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode
      }
    });
    setShowModal(false);
  };

  if (loading) return <div className="p-6 text-center">Loading invoice...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!invoice) return <div className="p-6 text-center">Invoice not found.</div>;

  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString();
  const customer = tempCustomerData || invoice.customer;
  const address = tempCustomerData ? tempCustomerData.address : invoice.delivery.address;

  // Determine which fields need to be filled in the modal
  const needsUpdate = {
    name: customer.name === "N/A",
    phone: customer.phone === "N/A",
    email: customer.email === "N/A",
    street: address.street === "N/A",
    city: address.city === "N/A",
    country: address.country === "N/A",
    postalCode: address.postalCode === "N/A"
  };

  return (
    <div>
      <div className="print:hidden flex justify-between items-center mb-6 p-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-blue-600 hover:underline transition-colors duration-200"
        >
          <Home size={24} />
          <span className="ml-2 font-bold text-lg">Home</span>
        </button>

        {/* Action Icons */}
        <div className="flex gap-4">
          <button onClick={handleDownload} className="text-gray-600 hover:text-green-600 transition-colors duration-200">
            <Download size={24} />
          </button>
          <button onClick={handlePrint} className="text-gray-600 hover:text-green-600 transition-colors duration-200">
            <Printer size={24} />
          </button>
          <button onClick={handleShare} className="text-gray-600 hover:text-green-600 transition-colors duration-200">
            <Share2 size={24} />
          </button>
          <button onClick={handleWhatsAppShare} className="text-gray-600 hover:text-green-600 transition-colors duration-200">
            <MapPin size={24} />
          </button>
        </div>
      </div>

      <div ref={invoiceRef} className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-lg border mt-10 mb-10 font-sans">
        {/* Status Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm text-center">
          <div className="flex justify-center items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#fcc005]" />
              <span className="text-[#fcc005] font-bold">CONFIRMED</span>
            </div>

            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-green-600" />
              <span className="text-green-700 font-bold">FULFILLED</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-800 uppercase">THANK YOU FOR USING OUR SERVICE</p>
            <p className="text-md font-semibold mt-1">REG. Nr. {invoice.company.regNumber}</p>
          </div>
        </div>

        {/* Store Information */}
        <div className="text-center mt-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.jpg" alt="Store Logo" width={120} height={120} className="rounded-full" />
          </div>
          <h2 className="text-2xl font-extrabold flex items-center justify-center">
            <Building2 className="w-7 h-7 mr-2 text-gray-700" /> {invoice.company.name}
          </h2>
          <p className="text-lg text-blue-600 underline hover:text-green-600 transition-colors duration-200">{invoice.company.website}</p>
          <p className="text-gray-600">{invoice.company.contact.phone}</p>
          <p className="text-gray-600">{invoice.company.contact.email}</p>
        </div>

        {/* Invoice Details */}
        <div className="mt-8 border-t pt-4">
          <p className="text-lg"><strong>Invoice No:</strong> #{invoice.invoiceNumber}</p>
          <p className="text-lg"><strong>Order Date:</strong> {invoiceDate}</p>
          <p className="text-lg"><strong>Delivery Contact:</strong> {invoice.company.contact.phone}</p>
        </div>

        {/* Items List */}
        <div className="mt-8 border-t pt-4">
          <h2 className="text-2xl font-bold mb-2">Items</h2>
          <table className="w-full text-md mt-2 border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border hover:bg-green-50 transition-colors duration-200">
                  <td className="p-2 border font-medium">{item.name}</td>
                  <td className="p-2 border font-medium">{item.quantity}</td>
                  <td className="p-2 border font-medium">R {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing */}
        <div className="mt-8 border-t pt-4">
          <p className="text-lg font-bold"><strong>Subtotal:</strong> R {invoice.pricing.subtotal}</p>
          <p className="text-2xl font-extrabold text-green-700"><strong>Total:</strong> R {invoice.pricing.total}</p>
        </div>

        {/* Page Break for Print */}
        <div className="page-break"></div>

        {/* Order Details */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Details</h2>
          <p className="text-lg"><strong>Customer:</strong> {customer.name} / {customer.phone} / {customer.email}</p>
          <p className="text-lg mt-2"><strong>Delivery:</strong></p>
          {address.street && address.street !== "N/A" && (
            <p className="text-lg">{address.street}</p>
          )}
          {address.city && address.city !== "N/A" && (
            <p className="text-lg">{address.city}</p>
          )}
          {address.country && address.country !== "N/A" && (
            <p className="text-lg">{address.country}</p>
          )}
          {address.postalCode && address.postalCode !== "N/A" && (
            <p className="text-lg">{address.postalCode}</p>
          )}
          <p className="text-lg text-blue-600 flex items-center hover:text-green-600 transition-colors duration-200">
            <MapPin className="w-6 h-6 mr-2" /> Map
          </p>
          <p className="text-lg mt-2">Please call on us again.</p>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Important Notice</h2>
          <p className="italic text-lg">
            NB: WHEN MAKING EFT PAYMENTS, PLEASE QUOTE YOUR INVOICE NR. THANK YOU.
          </p>
        </div>

        {/* Banking Details */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
            <CreditCard className="w-7 h-7 mr-2" /> Banking Details
          </h2>
          <p className="text-lg"><strong>Bank:</strong> {invoice.bankingDetails.bank}</p>
          <p className="text-lg"><strong>Account Number:</strong> {invoice.bankingDetails.accountNumber}</p>
          <p className="text-lg"><strong>Account Holder:</strong> {invoice.bankingDetails.accountHolder}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 print:hidden">
          {/* <button className="bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white py-3 px-6 rounded-lg text-lg font-bold">
            Pay Now
          </button> */}
          {/* <button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white py-3 px-6 rounded-lg text-lg font-bold">
            Email Invoice
          </button> */}
        </div>
      </div>

      {/* Modal for Customer Data */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <form onSubmit={handleModalSubmit}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Enter Customer Details</h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-600 hover:text-red-600">
                  <X size={24} />
                </button>
              </div>
              {needsUpdate.name && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" defaultValue={customer.name} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.phone && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" name="phone" defaultValue={customer.phone} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.email && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" defaultValue={customer.email} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.street && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input type="text" name="street" defaultValue={address.street} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.city && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" defaultValue={address.city} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.country && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" name="country" defaultValue={address.country} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              {needsUpdate.postalCode && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" name="postalCode" defaultValue={address.postalCode} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
              )}
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}

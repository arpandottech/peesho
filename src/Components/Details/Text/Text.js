import React from 'react'

const Text = ({ selectedSize }) => {
  return (
    <>
     <div className="px-4 sm:p-6 bg-white mb-24 mt-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4 sm:text-xl">
        Product Details
      </h2>

      <div className="space-y-3 text-black text-sm max-sm:text-[12px] leading-relaxed">
        <p className="italic">
          <span className="font-semibold">Model is Wearing:</span> {selectedSize} Size
        </p>
        <p className="italic">
          <span className="font-semibold">Model Height:</span> 5.5
        </p>
        <p className="italic">
          <span className="font-semibold">Care:</span> DRY CLEAN
        </p>
        <p className="italic">
          <span className="font-semibold">Shipping Info:</span> 12-15 Days
        </p>

        <div>
          <p className="font-semibold">Kurta:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Fabric – cotton fabric</li>
            <li>Kali cut</li>
            <li>Kurta Length – 47-48”</li>
            <li>Front Neck – 6 v shape (angrakha style)</li>
            <li>Back Neck – Covered (packed)</li>
            <li>Sleeves – Sleeveless</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Palazzo:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Fabric – cotton</li>
            <li>Length – 38-40”</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold">Dupatta:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Fabric – Mul Mul</li>
            <li>Length – 2.5 mar</li>
          </ul>
        </div>
      </div>
    </div>
    </>
  )
}

export default Text
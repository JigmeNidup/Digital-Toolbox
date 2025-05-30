"use client";

import Link from "next/link";

const Home = () => {
  const tools = [
    {
      name: "Merge PDF",
      description:
        "Combine PDFs in the order you want with the easiest PDF merger available.",
      icon: "/images/merge_pdf.png",
      href: "/merge_pdf",
    },
    {
      name: "Compress PDF",
      description: "Reduce file size while optimizing for maximal PDF quality.",
      icon: "/images/compress_pdf.png",
      href: "/compress_pdf",
    },
    {
      name: "Images to PDF",
      description: "Convert single or multiple images into single PDF",
      icon: "/images/img_to_pdf.png",
      href: "/img_to_pdf",
    },
    {
      name: "Remove Image Background",
      description: "Remove the background of the image.",
      icon: "/images/remove_bg.png",
      href: "/remove_bg",
    },
    // {
    //   name: "Sign PDF",
    //   description: "Add Signature to PDF",
    //   icon: "/images/remove_bg.png",
    //   href: "/sign_pdf",
    // },
  ];

  return (
    <div className="font-sans">
      <div className="container mx-auto p-4">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">Digital Tools</h1>
          <p>
            🔒 Worried about uploading your files just to merge PDFs? 😨 Fear
            not! 🤗 <br /> This web app does ALL the magic—merging PDFs,
            converting images to PDFs, and more—RIGHT on your device! 💻✨{" "}
            <br /> 🚫 No files are uploaded to any server—your data stays 100%
            private! <br /> 🔐 Merge with confidence! ✨📂➡️📘
          </p>
        </section>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src={tool.icon}
                  alt={`${tool.name} Icon`}
                  className="h-30"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-black">
                {tool.name}
              </h2>
              <p className="text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

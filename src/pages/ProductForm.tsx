import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { productApi } from "../services/api";
import type { CreateProductDto, ProductStatus, ProductVariant } from "../types";

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    basePrice: 0,
    virtualPrice: 0,
    brandId: "",
    images: [],
    variants: [],
    description: "",
    sizeGuide: "",
    provinceId: undefined,
    districtId: undefined,
    wardId: undefined,
    status: "DRAFT",
    categories: [],
    skus: [],
    attributes: [],
  });

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productApi.getById(productId);
      const product = response.data;
      setFormData({
        name: product.name,
        basePrice: product.basePrice,
        virtualPrice: product.virtualPrice,
        brandId: product.brandId || "",
        images: product.images || [],
        variants: product.variants || [],
        description: product.description || "",
        sizeGuide: product.sizeGuide || "",
        provinceId: product.provinceId,
        districtId: product.districtId,
        wardId: product.wardId,
        status: product.status,
        categories: product.categoryIds || [],
        skus:
          product.skus?.map((sku) => ({
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
          })) || [],
        attributes: product.attributes || [],
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      alert("Failed to load product. Returning to product list.");
      navigate("/products"); // Navigate back on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEdit && id) {
        await productApi.update({ ...formData, id });
      } else {
        await productApi.create(formData);
      }

      navigate("/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    // TODO: Update to match new API structure with value/options
    // setFormData({
    //   ...formData,
    //   variants: [...formData.variants, { value: "", options: [""] }],
    // });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | string[],
  ) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addAttribute = () => {
    // TODO: Update to match new API structure with name/value
    // setFormData({
    //   ...formData,
    //   attributes: [...formData.attributes, { name: "", value: "" }],
    // });
  };

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const updateAttribute = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addAttributeValue = (attrIndex: number) => {
    // Not applicable with new API structure
  };

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    // Not applicable with new API structure
  };

  const updateAttributeValue = (
    attrIndex: number,
    valueIndex: number,
    value: string,
  ) => {
    // Not applicable with new API structure
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {isEdit ? "Edit Product" : "Create Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Virtual Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.virtualPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      virtualPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand ID
              </label>
              <input
                type="text"
                value={formData.brandId}
                onChange={(e) =>
                  setFormData({ ...formData, brandId: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter brand ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProductStatus,
                  })
                }
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Images
          </h2>
          <div className="space-y-3">
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[index] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter(
                      (_, i) => i !== index,
                    );
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, images: [...formData.images, ""] })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Image URL
            </button>
          </div>
        </div>

        {/* Variants - TODO: Update UI to match new API structure */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Variants
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Variants management needs to be updated to match new API structure (value/options)
          </p>
        </div> */}

        {/* Attributes - TODO: Update UI to match new API structure */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Attributes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Attributes management needs to be updated to match new API structure (name/value pairs)
          </p>
        </div> */}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Product"
                : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BrandListItem, getBrands } from "@/lib/api/brands";
import { CategoryListItem, getCategories } from "@/lib/api/categories";
import {
  CreateProductData,
  ProductSKU,
  ProductVariant,
  UpdateProductData,
  getProductById,
} from "@/lib/api/products";
import { Product, ProductStatus } from "@/types";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Generate SKUs from variants
const generateSKUs = (variants: ProductVariant[]): ProductSKU[] => {
  if (!variants || variants.length === 0) {
    return [{ value: "default", price: 0, stock: 100, image: "" }];
  }

  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? "-" : ""}${y}`)),
      [""],
    );
  }

  const options = variants
    .map((variant) => variant.options)
    .filter((opt) => opt.length > 0);

  if (options.length === 0) {
    return [{ value: "default", price: 0, stock: 100, image: "" }];
  }

  const combinations = getCombinations(options);

  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: "",
  }));
};

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories and Brands data
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selected categories state (for hierarchical selection)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<CreateProductData>>({
    name: "",
    basePrice: 0,
    virtualPrice: 0,
    brandId: "",
    images: [],
    shopId: "",
    description: "",
    status: "DRAFT",
    categories: [],
    skus: [],
    variants: [],
    attributes: [],
    isApproved: false,
    createdById: null,
    updatedById: null,
  });

  // Fetch categories and brands
  const fetchCategoriesAndBrands = useCallback(async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, brandsRes] = await Promise.all([
        getCategories(),
        getBrands({ page: 1, limit: 100 }),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setBrands(brandsRes.data.brands || []);
    } catch (error) {
      console.error("Failed to fetch categories/brands:", error);
      toast.error("Không thể tải danh mục và thương hiệu");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategoriesAndBrands();
    }
  }, [open, fetchCategoriesAndBrands]);

  // Fetch full product details when editing
  const fetchProductDetails = useCallback(async (productId: string) => {
    try {
      setLoadingProduct(true);
      const response = await getProductById(productId);
      const productData = response.data;

      const categoryIds =
        productData.categoryIds ||
        productData.categories?.map((c: { id: string }) => c.id) ||
        [];

      setFormData({
        name: productData.name,
        basePrice: productData.basePrice,
        virtualPrice: productData.virtualPrice || 0,
        brandId: productData.brandId,
        images: productData.images || [],
        shopId: productData.shopId,
        description: productData.description || "",
        status: productData.status,
        categories: categoryIds,
        skus: (productData.skus || []).map((s: any) => ({
          ...s,
          stock: s.stock ?? s.quantity ?? 0,
        })),
        variants: productData.variants || [],
        provinceId: productData.provinceId,
        provinceName: productData.provinceName,
        districtId: productData.districtId,
        districtName: productData.districtName,
        wardId: productData.wardId,
        wardName: productData.wardName,
        sizeGuide: productData.sizeGuide,
        attributes: productData.attributes || [],
        isApproved: productData.isApproved,
        createdById: productData.createdById,
        updatedById: productData.updatedById,
      });
      setSelectedCategoryIds(categoryIds);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  useEffect(() => {
    if (open && product?.id) {
      fetchProductDetails(product.id);
    } else if (!open || !product) {
      setFormData({
        name: "",
        basePrice: 0,
        virtualPrice: 0,
        brandId: "",
        images: [],
        shopId: "",
        description: "",
        status: "DRAFT",
        categories: [],
        skus: [],
        variants: [],
        attributes: [],
        isApproved: false,
        createdById: null,
        updatedById: null,
      });
      setSelectedCategoryIds([]);
    }
    setErrors({});
  }, [product, open, fetchProductDetails]);

  // Get parent categories (categories without parentCategoryId or parentCategoryId is null)
  const getParentCategories = () => {
    return categories.filter((c) => !c.parentCategoryId);
  };

  // Get child categories for a parent
  const getChildCategories = (parentId: string) => {
    return categories.filter((c) => c.parentCategoryId === parentId);
  };

  // Handle parent category selection
  const handleParentCategoryChange = (index: number, categoryId: string) => {
    const newSelectedIds = [...selectedCategoryIds];
    // Remove all subsequent selections when parent changes
    newSelectedIds.splice(index);
    if (categoryId) {
      newSelectedIds.push(categoryId);
    }
    setSelectedCategoryIds(newSelectedIds);
    setFormData({ ...formData, categories: newSelectedIds });
  };

  // Add child category selector
  const addChildCategorySelector = () => {
    // Don't add if no categories are selected yet
    if (selectedCategoryIds.length === 0) return;
    // Check if the last selected category has children
    const lastCategoryId = selectedCategoryIds[selectedCategoryIds.length - 1];
    const children = getChildCategories(lastCategoryId);
    if (children.length === 0) {
      toast.error("Danh mục này không có danh mục con");
      return;
    }
    // The selector will be shown when we have children available
  };

  // Image management
  const addImageInput = () => {
    setFormData({
      ...formData,
      images: [...(formData.images || []), ""],
    });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  // Auto-generate SKUs when variants change
  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    const newSKUs = generateSKUs(newVariants);

    // Preserve existing SKU prices and quantities if the value matches
    const existingSKUs = formData.skus || [];
    const mergedSKUs = newSKUs.map((newSku) => {
      const existing = existingSKUs.find((s) => s.value === newSku.value);
      return existing || newSku;
    });

    setFormData({
      ...formData,
      variants: newVariants,
      skus: mergedSKUs,
    });
  };

  // Add new variant
  const addVariant = () => {
    const newVariants = [
      ...(formData.variants || []),
      { value: "", options: [] },
    ];
    handleVariantsChange(newVariants);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const newVariants = (formData.variants || []).filter((_, i) => i !== index);
    handleVariantsChange(newVariants);
  };

  // Update variant name
  const updateVariantName = (index: number, value: string) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], value };
    setFormData({ ...formData, variants: newVariants });
  };

  // Update variant options
  const updateVariantOptions = (index: number, optionsStr: string) => {
    const newVariants = [...(formData.variants || [])];
    const options = optionsStr
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o !== "");
    newVariants[index] = { ...newVariants[index], options };
    handleVariantsChange(newVariants);
  };

  // Attributes management
  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...(formData.attributes || []), { name: "", value: "" }],
    });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = (formData.attributes || []).filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, attributes: newAttributes });
  };

  const updateAttribute = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const newAttributes = [...(formData.attributes || [])];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setFormData({ ...formData, attributes: newAttributes });
  };

  // Update SKU
  const updateSKU = (
    index: number,
    field: keyof ProductSKU,
    value: string | number,
  ) => {
    const newSKUs = [...(formData.skus || [])];
    newSKUs[index] = { ...newSKUs[index], [field]: value };
    setFormData({ ...formData, skus: newSKUs });
  };

  // Get category name by ID
  const getCategoryName = (id: string) => {
    const category = categories.find((c) => c.id === id);
    return category?.name || id;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    console.log("Validating form data:", formData);

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = "Giá cơ bản phải lớn hơn 0";
    }

    if (!formData.shopId || formData.shopId.trim() === "") {
      newErrors.shopId = "Shop ID là bắt buộc";
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "Vui lòng chọn ít nhất một danh mục";
    }

    if (!formData.skus || formData.skus.length === 0) {
      newErrors.skus = "Vui lòng thêm ít nhất một SKU";
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed. Check console for details.");
      toast.error("Vui lòng kiểm tra lại thông tin form");
      return;
    }

    setLoading(true);

    // Sanitize data
    const submissionData = {
      ...formData,
      brandId: formData.brandId === "" ? null : formData.brandId,
    };

    try {
      if (product) {
        await onSubmit({
          ...(submissionData as CreateProductData), // brandId can be null, cast to unknown first if needed but CreateProductData allows optional/undefined. Actually API expects null if not present? No, null is valid.
          // Wait, CreateProductData has brandId?: string. It does not explicitly say | null.
          // But API allows null. Let's update CreateProductData first to allow string | null.
          id: product.id,
        } as UpdateProductData);
      } else {
        await onSubmit(submissionData as unknown as CreateProductData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Cập nhật thông tin sản phẩm"
              : "Điền thông tin để tạo sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>

        {loadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Đang tải thông tin sản phẩm...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên sản phẩm */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nhập tên sản phẩm"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Giá */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">
                  Giá cơ bản <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className={errors.basePrice ? "border-destructive" : ""}
                />
                {errors.basePrice && (
                  <p className="text-xs text-destructive">{errors.basePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="virtualPrice">Giá hiển thị</Label>
                <Input
                  id="virtualPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.virtualPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      virtualPrice: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Giá gạch ngang (nếu có)
                </p>
              </div>
            </div>

            {/* Brand và Shop ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandId">Thương hiệu</Label>
                <select
                  id="brandId"
                  value={formData.brandId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, brandId: e.target.value })
                  }
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.brandId ? "border-destructive" : ""
                  }`}
                  disabled={loadingData}
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="text-xs text-destructive">{errors.brandId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopId">
                  Shop ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shopId"
                  value={formData.shopId}
                  onChange={(e) =>
                    setFormData({ ...formData, shopId: e.target.value })
                  }
                  placeholder="UUID của shop"
                  className={errors.shopId ? "border-destructive" : ""}
                />
                {errors.shopId && (
                  <p className="text-xs text-destructive">{errors.shopId}</p>
                )}
              </div>
            </div>

            {/* Trạng thái và Duyệt */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Trạng thái <span className="text-destructive">*</span>
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProductStatus,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="BANNED">Bị cấm</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                <Label htmlFor="isApproved">Đã duyệt</Label>
                <div className="flex items-center space-x-2 pt-1">
                  <Switch
                    id="isApproved"
                    checked={formData.isApproved || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isApproved: checked })
                    }
                  />
                  <Label
                    htmlFor="isApproved"
                    className="text-sm text-muted-foreground"
                  >
                    {formData.isApproved ? "Đã duyệt" : "Chưa duyệt"}
                  </Label>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>

            {/* Hình ảnh */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Hình ảnh sản phẩm
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageInput}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm hình
                </Button>
              </div>

              {(formData.images || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có hình ảnh. Nhấn "Thêm hình" để thêm URL hình ảnh.
                </p>
              ) : (
                <div className="space-y-2">
                  {(formData.images || []).map((image, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={image}
                        onChange={(e) => updateImage(index, e.target.value)}
                        placeholder={`URL hình ảnh ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(index)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-3 border rounded-lg p-4">
              <Label className="text-base font-semibold">
                Danh mục sản phẩm <span className="text-destructive">*</span>
              </Label>
              {errors.categories && (
                <p className="text-xs text-destructive">{errors.categories}</p>
              )}

              {loadingData ? (
                <p className="text-sm text-muted-foreground">
                  Đang tải danh mục...
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Parent category selector */}
                  <div className="flex gap-2 items-center">
                    <select
                      value={selectedCategoryIds[0] || ""}
                      onChange={(e) =>
                        handleParentCategoryChange(0, e.target.value)
                      }
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">-- Chọn danh mục cha --</option>
                      {getParentCategories().map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {selectedCategoryIds.length > 0 &&
                      getChildCategories(
                        selectedCategoryIds[selectedCategoryIds.length - 1],
                      ).length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addChildCategorySelector}
                          title="Thêm danh mục con"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                  </div>

                  {/* Child category selectors */}
                  {selectedCategoryIds.slice(0, -1).map((catId, index) => {
                    const children = getChildCategories(catId);
                    if (children.length === 0) return null;
                    return (
                      <div
                        key={index + 1}
                        className="flex gap-2 items-center pl-4"
                      >
                        <span className="text-muted-foreground">↳</span>
                        <select
                          value={selectedCategoryIds[index + 1] || ""}
                          onChange={(e) =>
                            handleParentCategoryChange(
                              index + 1,
                              e.target.value,
                            )
                          }
                          className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">-- Chọn danh mục con --</option>
                          {children.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newIds = selectedCategoryIds.slice(
                              0,
                              index + 1,
                            );
                            setSelectedCategoryIds(newIds);
                            setFormData({ ...formData, categories: newIds });
                          }}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {/* Show last selected category's children if available */}
                  {selectedCategoryIds.length > 0 &&
                    (() => {
                      const lastCatId =
                        selectedCategoryIds[selectedCategoryIds.length - 1];
                      const children = getChildCategories(lastCatId);
                      if (children.length === 0) return null;
                      return (
                        <div className="flex gap-2 items-center pl-4">
                          <span className="text-muted-foreground">↳</span>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const newIds = [
                                  ...selectedCategoryIds,
                                  e.target.value,
                                ];
                                setSelectedCategoryIds(newIds);
                                setFormData({
                                  ...formData,
                                  categories: newIds,
                                });
                              }
                            }}
                            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">
                              -- Chọn danh mục con (tùy chọn) --
                            </option>
                            {children.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })()}

                  {/* Display selected categories */}
                  {selectedCategoryIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Đã chọn:
                      </span>
                      {selectedCategoryIds.map((id) => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                        >
                          {getCategoryName(id)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Attributes Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Thuộc tính sản phẩm (Attributes)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm thuộc tính
                </Button>
              </div>

              {(formData.attributes || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có thuộc tính. Thêm thuộc tính như Chất liệu, Xuất xứ...
                </p>
              ) : (
                <div className="space-y-3">
                  {(formData.attributes || []).map((attr, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center p-3 border rounded-md bg-muted/30"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Tên (VD: Chất liệu)"
                          value={attr.name}
                          onChange={(e) =>
                            updateAttribute(index, "name", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Giá trị (VD: Cotton 100%)"
                          value={attr.value}
                          onChange={(e) =>
                            updateAttribute(index, "value", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttribute(index)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Biến thể sản phẩm (Variants)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm biến thể
                </Button>
              </div>

              {(formData.variants || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có biến thể. Thêm biến thể như Màu sắc, Kích thước...
                </p>
              ) : (
                <div className="space-y-3">
                  {(formData.variants || []).map((variant, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start p-3 border rounded-md bg-muted/30"
                    >
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Tên biến thể (VD: Màu sắc, Size)"
                          value={variant.value}
                          onChange={(e) =>
                            updateVariantName(index, e.target.value)
                          }
                        />
                        <Input
                          placeholder="Các tùy chọn, phân cách bằng dấu phẩy (VD: Đỏ, Xanh, Vàng)"
                          value={variant.options.join(", ")}
                          onChange={(e) =>
                            updateVariantOptions(index, e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SKUs Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <Label className="text-base font-semibold">
                SKU ({(formData.skus || []).length} mục)
              </Label>
              {errors.skus && (
                <p className="text-xs text-destructive">{errors.skus}</p>
              )}

              {(formData.skus || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  SKU sẽ được tự động tạo từ biến thể
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 sticky top-0 bg-background py-1">
                    <div className="col-span-3">Mã SKU</div>
                    <div className="col-span-2">Giá</div>
                    <div className="col-span-2">Số lượng</div>
                    <div className="col-span-5">Hình ảnh URL</div>
                  </div>
                  {(formData.skus || []).map((sku, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-muted/20"
                    >
                      <div className="col-span-3">
                        <Input
                          value={sku.value}
                          onChange={(e) =>
                            updateSKU(index, "value", e.target.value)
                          }
                          placeholder="Mã SKU"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          value={sku.price}
                          onChange={(e) =>
                            updateSKU(index, "price", Number(e.target.value))
                          }
                          placeholder="Giá"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          value={sku.stock}
                          onChange={(e) =>
                            updateSKU(index, "stock", Number(e.target.value))
                          }
                          placeholder="Số lượng"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={sku.image || ""}
                          onChange={(e) =>
                            updateSKU(index, "image", e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

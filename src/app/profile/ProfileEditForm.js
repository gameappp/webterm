"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@heroui/react";

const ProfileEditForm = ({ user, onSave, loading }) => {
  const [formData, setFormData] = useState({
    nickName: user?.nickName || "",
    userName: user?.userName || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [errors, setErrors] = useState({});

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        nickName: user.nickName || "",
        userName: user.userName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nickName.trim()) {
      newErrors.nickName = "نام نمایشی الزامی است";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "نام کاربری الزامی است";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "شماره تلفن الزامی است";
    } else if (!/^09\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "شماره تلفن معتبر نیست (مثال: 09123456789)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent group">
        <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
          <Input
            type="text"
            label="نام نمایشی"
            placeholder="نام نمایشی خود را وارد کنید"
            variant="bordered"
            labelPlacement="outside"
            value={formData.nickName}
            onValueChange={(value) => handleChange("nickName", value)}
            classNames={{
              label: "!text-gray-200 -bottom-0 text-xs font-medium",
              input: "placeholder:text-xs text-sm !text-white",
              inputWrapper:
                "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/5 min-h-12 group-hover:border-blueColor/30 transition-colors",
            }}
            isInvalid={errors.nickName ? true : false}
            errorMessage={errors.nickName}
          />
        </div>
      </div>

      <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent group">
        <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
          <Input
            type="text"
            label="نام کاربری"
            placeholder="نام کاربری خود را وارد کنید"
            variant="bordered"
            labelPlacement="outside"
            value={formData.userName}
            onValueChange={(value) => handleChange("userName", value)}
            classNames={{
              label: "!text-gray-200 -bottom-0 text-xs font-medium",
              input: "placeholder:text-xs text-sm !text-white",
              inputWrapper:
                "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/5 min-h-12 group-hover:border-blueColor/30 transition-colors",
            }}
            isInvalid={errors.userName ? true : false}
            errorMessage={errors.userName}
          />
        </div>
      </div>

      <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent group">
        <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
          <Input
            type="text"
            label="شماره تلفن"
            placeholder="09123456789"
            variant="bordered"
            labelPlacement="outside"
            disabled
            value={formData.phoneNumber}
            onValueChange={(value) => handleChange("phoneNumber", value)}
            classNames={{
              label: "!text-gray-200 -bottom-0 text-xs font-medium",
              input: "placeholder:text-xs text-sm !text-white",
              inputWrapper:
                "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/5 min-h-12 group-hover:border-blueColor/30 transition-colors",
            }}
            isInvalid={errors.phoneNumber ? true : false}
            errorMessage={errors.phoneNumber}
          />
        </div>
      </div>

      <div className="w-full flex justify-end mt-2">
        <Button
          type="submit"
          isLoading={loading}
          className="!bg-blueColor text-white !shadow-none min-w-36 hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300"
          size="md"
        >
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;

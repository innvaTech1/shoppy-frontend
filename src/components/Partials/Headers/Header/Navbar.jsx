import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Arrow from "../../../Helpers/icons/Arrow";
import ServeLangItem from "../../../Helpers/ServeLangItem";
export default function Navbar({ className }) {
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const categoryList = websiteSetup && websiteSetup.payload.productCategories;
  const mageMenuList = websiteSetup && websiteSetup.payload.megaMenuCategories;
  const megaMenuBanner = websiteSetup && websiteSetup.payload.megaMenuBanner;
  const customPages = websiteSetup && websiteSetup.payload.customPages;
  const [categoryToggle, setToggle] = useState(false);
  const [subCatHeight, setHeight] = useState(null);
  const handler = () => {
    setToggle(!categoryToggle);
  };

  // useEffect(() => {
  //   let categorySelector = document.querySelector(".category-dropdown");
  //   setHeight(categorySelector.offsetHeight);
  // }, [categoryToggle]);
  return (
    <div
      className={`nav-widget-wrapper w-full  h-[60px] relative z-30  ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            <div className="category-and-nav flex xl:rtl:space-x-reverse rtl:space-x-reverse space-x-3 items-center">
              <div className="nav">
                <ul className="nav-wrapper flex xl:space-x-10 rtl:space-x-reverse space-x-5">
                  <li>
                    <span className="flex items-center text-sm font-600 cursor-pointer text-qblack ">
                      <span>{ServeLangItem()?.Shop}</span>
                      <span className="ml-1.5 ">
                        <Arrow className="fill-current" />
                      </span>
                    </span>
                    <div className="sub-menu w-full absolute left-0 top-[60px]">
                      <div
                        className="mega-menu-wrapper w-full bg-white p-[30px] flex justify-between items-center "
                        style={{
                          minHeight: "295px",
                          boxShadow: "0px 15px 50px 0px rgba(0, 0, 0, 0.14)",
                        }}
                      >
                        <div className="categories-wrapper flex-1 h-full flex justify-around -ml-[70px]">
                          {mageMenuList &&
                            mageMenuList.slice(0, 3).map((megaItem) => (
                              <div key={megaItem.id}>
                                <div className="category">
                                  <h1 className="text-[13px] font-700 text-qblack uppercase mb-[13px]">
                                    {megaItem.category.name}
                                  </h1>
                                </div>
                                <div className="category-items">
                                  <ul className="flex flex-col space-y-2">
                                    {megaItem.sub_categories.length > 0 &&
                                      megaItem.sub_categories.map((subItem) => (
                                        <li key={subItem.id}>
                                          <Link
                                            href={{
                                              pathname: "/products",
                                              query: {
                                                sub_category:
                                                  subItem.sub_category &&
                                                  subItem.sub_category.slug,
                                              },
                                            }}
                                            passHref
                                            rel="noopener noreferrer"
                                          >
                                            
                                              <span className="text-qgray text-sm font-400 border-b border-transparent hover:border-qyellow hover:text-qyellow cursor-pointer">
                                                {subItem.sub_category &&
                                                  subItem.sub_category.name}
                                              </span>
                                            
                                          </Link>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                        </div>
                        {megaMenuBanner &&
                          parseInt(megaMenuBanner.status) === 1 && (
                            <div
                              style={{
                                backgroundImage: `url(${
                                  process.env.NEXT_PUBLIC_BASE_URL +
                                  megaMenuBanner.image
                                })`,
                                backgroundSize: "contain",
                                backgroundRepeat: "no-repeat",
                              }}
                              className="thumbnil w-[348px] h-[235px] relative flex items-center ltr:pl-[40px] rtl:pr-[40px] group"
                            >
                              <div className="flex flex-col justify-between">
                                <div>
                                  <div className=" mb-[10px]">
                                    <span className="text-qblack uppercase text-xs font-semibold">
                                      {megaMenuBanner.title_one}
                                    </span>
                                  </div>
                                  <div className="mb-[30px]">
                                    <h1 className="w-[160px] text-[24px] leading-[32px] text-qblack font-semibold">
                                      {megaMenuBanner.title_two}
                                    </h1>
                                  </div>
                                </div>
                                <div className="w-[90px]">
                                  <Link
                                    href={{
                                      pathname: "/products",
                                      query: {
                                        category: megaMenuBanner.product_slug,
                                      },
                                    }}
                                    passHref
                                  >
                                    
                                      <div className="cursor-pointer w-full relative  ">
                                        <div className="inline-flex  rtl:space-x-reverse space-x-1.5 items-center relative z-20">
                                          <span className="text-sm text-qblack font-medium leading-[30px]">
                                            {ServeLangItem()?.Shop_Now}
                                          </span>
                                          <span className="leading-[30px]">
                                            <svg
                                              className={`transform rtl:rotate-180 fill-current`}
                                              width="7"
                                              height="11"
                                              viewBox="0 0 7 11"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <rect
                                                x="2.08984"
                                                y="0.636719"
                                                width="6.94219"
                                                height="1.54271"
                                                transform="rotate(45 2.08984 0.636719)"
                                              />
                                              <rect
                                                x="7"
                                                y="5.54492"
                                                width="6.94219"
                                                height="1.54271"
                                                transform="rotate(135 7 5.54492)"
                                              />
                                            </svg>
                                          </span>
                                        </div>
                                        <div className="w-[82px] transition-all duration-300 ease-in-out group-hover:h-4 h-[0px] bg-qyellow absolute left-0 bottom-0 z-10"></div>
                                      </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </li>

                  {categoryList &&
                    categoryList.map((item) => (
                      <li key={item.id} className="category-item">
                        <Link
                          className=" text-sm text-gray-500 opacity-100 truncate hover:opacity-90 transition-all duration-300 ease-in-out cursor-pointer"
                          href={{
                            pathname: "/products",
                            query: { category: item.slug },
                          }}
                          passHref
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Select } from "antd";

export function EntitySelect({name,initialValue,options}:{name:string;initialValue?:string;options:{label:string;value:string}[]}){const[value,setValue]=useState(initialValue);return <><Select className="w-full" options={options} value={value} onChange={setValue}/><input type="hidden" name={name} value={value??""}/></>}

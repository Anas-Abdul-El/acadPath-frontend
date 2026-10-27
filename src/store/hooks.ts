import { useDispatch, useSelector } from "react-redux"

import type { RootState } from "@/store/root-reducer"
import type { AppDispatch } from "@/store/store"

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

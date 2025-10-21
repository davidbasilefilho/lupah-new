import { createFormHook } from "@tanstack/react-form";

import {
	DatePicker,
	Select,
	SubscribeButton,
	TextArea,
	TextField,
} from "../components/FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		Select,
		TextArea,
		DatePicker,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});

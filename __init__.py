MAX_SLOTS = 20

class ConditionalStringConcat:
    @classmethod
    def INPUT_TYPES(cls):
        optional = {}
        for i in range(1, MAX_SLOTS + 1):
            optional[f"text{i}"] = ("STRING", {"default": "", "multiline": True})
            optional[f"enable{i}"] = ("BOOLEAN", {"default": True})

        return {
            "required": {
                "separator": ("STRING", {"default": ", "}),
            },
            "optional": optional,
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("concatenated",)
    FUNCTION = "concat"
    CATEGORY = "utils/string"

    def concat(self, separator, **kwargs):
        parts = []
        for i in range(1, MAX_SLOTS + 1):
            text = kwargs.get(f"text{i}", "")
            enabled = kwargs.get(f"enable{i}", False)
            if enabled and text.strip():
                parts.append(text)
        return (separator.join(parts),)


NODE_CLASS_MAPPINGS = {"ConditionalStringConcat": ConditionalStringConcat}
NODE_DISPLAY_NAME_MAPPINGS = {"ConditionalStringConcat": "Conditional String Concat"}

WEB_DIRECTORY = "./web"
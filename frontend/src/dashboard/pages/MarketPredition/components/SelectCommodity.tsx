import { useState, useMemo } from "react";
import { ChevronDown, Tag } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";

const SelectCommodity = ({ commodities, selected, setSelected,  popoverWidthClass = "max-w-md" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCommodities = useMemo(() => {
    return commodities.filter((c) =>
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, commodities]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Tag className="w-4 h-4 inline-block mr-1" />
        Pilih Komoditas
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-[14px] sm:text-[14px] w-full h-8 font-normal flex items-center justify-between px-3 py-5 overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {selected || "Contoh: Beras Medium"}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className={`w-[var(--radix-popover-trigger-width)] max-w-sm sm:${popoverWidthClass} p-2`}
        >
          <Input
            placeholder="Cari komoditas..."
            className="w-full mb-2 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto text-sm space-y-1">
            {filteredCommodities.length > 0 ? (
              filteredCommodities.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setSelected(item);
                    setOpen(false);
                  }}
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="text-gray-400 px-2 py-1">Tidak ditemukan</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectCommodity;
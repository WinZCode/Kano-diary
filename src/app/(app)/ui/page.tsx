/*
 * /ui — trang trưng bày UI primitives để kiểm tra giao diện so với mockup.
 * Chỉ dùng khi phát triển: bản production trả 404.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardTitle,
  Field,
  fieldDescribedBy,
  Input,
  PixelIcon,
  ProgressBar,
  SegmentedControl,
  Select,
  StatCard,
} from "@/components/ui";
import { PIXEL_ICONS, type PixelIconName } from "@/components/ui/pixel-icons";

export const metadata: Metadata = { title: "Bộ giao diện" };

const ICON_NAMES = Object.keys(PIXEL_ICONS) as PixelIconName[]; // an toàn: key lấy từ chính object

const SWATCHES = [
  ["bg-primary", "primary"],
  ["bg-secondary", "secondary"],
  ["bg-tertiary", "tertiary"],
  ["bg-positive", "positive"],
  ["bg-warning", "warning"],
  ["bg-error", "error"],
  ["bg-primary-container", "primary-container"],
  ["bg-surface-container", "surface-container"],
] as const;

export default function UiGalleryPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <PageHeader eyebrow="Chỉ hiện khi dev" title="Bộ giao diện" description="Tất cả component trong components/ui." />

      <div className="grid gap-6">
        {/* Thẻ chỉ số */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Calo còn lại"
            value="1.906"
            unit="kcal"
            icon="flame"
            footer={<ProgressBar value={1200} max={1906} label="Calo đã nạp" />}
          />
          <StatCard
            label="Nước"
            value="1.5"
            unit="L"
            icon="drop"
            badge={<Badge tone="cyan">6/8</Badge>}
            footer={<ProgressBar value={1500} max={2000} label="Nước đã uống" tone="cyan" />}
          />
          <StatCard label="Giấc ngủ" value="7.5" unit="giờ" icon="moon" badge={<Badge tone="ok">Tốt</Badge>} />
          <StatCard label="Cân nặng" value="82.4" unit="kg" icon="chart" badge={<Badge tone="purple">-0.6</Badge>} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Nút & badge */}
          <Card tone="pink">
            <CardTitle icon={<PixelIcon name="plus" className="text-primary" />}>Nút & Badge</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">
                <PixelIcon name="plus" size={12} /> Thêm bữa ăn
              </Button>
              <Button>Mặc định</Button>
              <Button variant="secondary">Tím</Button>
              <Button variant="cyan">+ 250 ml</Button>
              <Button variant="danger" size="sm">
                Xóa
              </Button>
              <Button disabled>Đã tắt</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Protein</Badge>
              <Badge tone="ok">Đạt mục tiêu</Badge>
              <Badge tone="warn">Vượt 120 kcal</Badge>
              <Badge tone="alert">Dưới sàn an toàn</Badge>
              <Badge tone="cyan">Nước</Badge>
              <Badge tone="purple">Giấc ngủ</Badge>
            </div>
          </Card>

          {/* Form */}
          <Card tone="purple">
            <CardTitle>Form</CardTitle>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field htmlFor="demo-weight" label="Cân nặng" hint="Cân buổi sáng, trước khi ăn">
                  <Input
                    id="demo-weight"
                    inputMode="decimal"
                    unit="kg"
                    defaultValue="83"
                    aria-describedby={fieldDescribedBy("demo-weight", { hint: true })}
                  />
                </Field>
                <Field htmlFor="demo-height" label="Chiều cao" error="Chiều cao phải từ 100 đến 250 cm">
                  <Input
                    id="demo-height"
                    inputMode="decimal"
                    unit="cm"
                    defaultValue="17"
                    invalid
                    aria-describedby={fieldDescribedBy("demo-height", { error: true })}
                  />
                </Field>
              </div>
              <Field htmlFor="demo-activity" label="Mức vận động">
                <Select id="demo-activity" defaultValue="light">
                  <option value="sedentary">Ít vận động</option>
                  <option value="light">Nhẹ (1–3 buổi/tuần)</option>
                  <option value="moderate">Vừa (3–5 buổi/tuần)</option>
                  <option value="active">Nhiều (6–7 buổi/tuần)</option>
                </Select>
              </Field>
              <SegmentedControl
                name="demo-speed"
                legend="Tốc độ giảm cân"
                defaultValue="medium"
                options={[
                  { value: "slow", label: "Chậm", hint: "-0.25 kg/tuần" },
                  { value: "medium", label: "Vừa", hint: "-0.5 kg/tuần" },
                  { value: "fast", label: "Nhanh", hint: "-0.75 kg/tuần" },
                ]}
              />
              <SegmentedControl
                name="demo-sex"
                legend="Giới tính"
                tone="purple"
                defaultValue="male"
                options={[
                  { value: "male", label: "Nam" },
                  { value: "female", label: "Nữ" },
                ]}
              />
            </div>
          </Card>

          {/* Thanh tiến độ */}
          <Card tone="cyan">
            <CardTitle>Thanh tiến độ</CardTitle>
            <div className="grid gap-3">
              {(
                [
                  ["Protein", 98, 141, "pink"],
                  ["Carb", 150, 210, "purple"],
                  ["Nước", 1500, 2000, "cyan"],
                  ["Fat", 70, 60, "amber"],
                  ["Ngày đạt mục tiêu", 5, 7, "green"],
                ] as const
              ).map(([label, value, max, tone]) => (
                <div key={label} className="grid gap-1">
                  <div className="flex justify-between font-label text-label font-bold">
                    <span>{label}</span>
                    <span className="tabular-nums">
                      {value}/{max}
                    </span>
                  </div>
                  <ProgressBar value={value} max={max} label={label} tone={tone} />
                </div>
              ))}
            </div>
          </Card>

          {/* Icon & màu */}
          <Card>
            <CardTitle>Icon & Màu</CardTitle>
            <div className="flex flex-wrap gap-3">
              {ICON_NAMES.map((name) => (
                <div key={name} className="flex w-16 flex-col items-center gap-1">
                  <PixelIcon name={name} size={24} className="text-primary" />
                  <span className="font-label text-[0.625rem] text-on-surface-variant">{name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {SWATCHES.map(([cls, label]) => (
                <div key={cls} className="grid gap-1">
                  <div className={`h-8 border-2 border-outline ${cls}`} />
                  <span className="truncate font-label text-[0.625rem] text-on-surface-variant">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card variant="soft">
          <p className="font-pixel text-xl">PIXEL 0123456789</p>
          <p className="font-headline font-bold">JetBrains Mono — Tiêu đề có dấu: ăn uống, giấc ngủ</p>
          <p>Be Vietnam Pro — Nội dung chính, dễ đọc trên điện thoại: ỷ ỹ ữ ặ ẫ.</p>
        </Card>
      </div>
    </>
  );
}

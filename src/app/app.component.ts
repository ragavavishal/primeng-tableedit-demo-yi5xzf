import { Component } from "@angular/core";
import { ProductService } from "./productservice";
import { Product } from "./product";
import { FilterUtils } from "primeng/utils";
import { LazyLoadEvent } from "primeng/api";
import { SelectItem } from "primeng/api";
import { MessageService } from "primeng/api";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  providers: [MessageService],
  styles: [
    `
      :host ::ng-deep .p-cell-editing {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    `
  ]
})
export class AppComponent {
  load: boolean = false;
  products1: Product[];

  products2: Product[];

  statuses: SelectItem[];

  clonedProducts: { [s: string]: Product } = {};

  editForm: FormGroup;

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this.productService.getProductsSmall().then(data => {
      this.products2 = data;

      this.products2 = this.products2.slice(0, 5);

      this.editForm = this._fb.group({
        fields: this._fb.array([])
      });
      this.products2.map((item, index) => {
        this.fieldsArray.push(this.addFieldsGroup(item));
      });
      this.load = true;
    });

    this.statuses = [
      { label: "In Stock", value: "INSTOCK" },
      { label: "Low Stock", value: "LOWSTOCK" },
      { label: "Out of Stock", value: "OUTOFSTOCK" }
    ];
  }

  addFieldsGroup(item: Product) {
    return this._fb.group({
      id: [item.id, Validators.required],
      code: [item.code, Validators.required],
      name: [item.name, Validators.required],
      inventoryStatus: [item.inventoryStatus, Validators.required],
      price: [item.price, Validators.required]
    });
  }

  get fieldsArray() {
    return <FormArray>this.editForm.get("fields");
  }

  addNewRow() {
    let item: Product = {
      id: "0",
      code: "",
      name: "",
      inventoryStatus: "",
      price: null
    };
    this.products2.push(item);
    this.fieldsArray.push(this.addFieldsGroup(item));
  }

  removeFields(index) {
    this.load = false;
    this.fieldsArray.removeAt(index);
    this.editForm.updateValueAndValidity();
    this.products2.splice(index, 1);
    this.load = true;
  }

  onSubmit() {
    console.log("Form Value", this.editForm.value);
    console.log("Formarray Controls", this.fieldsArray.controls);
    console.log("Products Var Value", this.products2);
    const filtered = this.fieldsArray.value.filter((item, index) => {
      if (this.fieldsArray.controls[index].dirty) {
        return true;
      }
      return false;
    });
    console.log("Edited Data", filtered);
  }

  onRowEditInit(product: Product) {
    this.clonedProducts[product.id] = { ...product };
  }

  onRowEditSave(product: Product) {
    if (product.price > 0) {
      delete this.clonedProducts[product.id];
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: "Product is updated"
      });
    } else {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Invalid Price"
      });
    }
  }

  onRowEditCancel(product: Product, index: number) {
    this.products2[index] = this.clonedProducts[product.id];
    delete this.products2[product.id];
  }
}

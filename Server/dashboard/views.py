from django.shortcuts import render, redirect, get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from employee.models import Department, DynamicField, Employee, EmployeeFieldData
from django.contrib import messages
from django.db.models import Count


def dashboard(request):
    return render(request, 'dashboard.html')

@login_required
def employee_details(request):
    user = request.user
    department_id = request.GET.get("department")
    search_query = request.GET.get("q", "")
    page = request.GET.get("page", 1) 

    departments = Department.objects.filter(created_by=user).order_by('name')
    selected_department = None
    columns = []
    employees_data = []

    if department_id:
        try:
            selected_department = departments.get(id=department_id)
        except Department.DoesNotExist:
            selected_department = None

    if selected_department:
        dynamic_fields = list(selected_department.fields.order_by('order'))
        columns = [
            {
                "key": str(field.id),
                "label": field.label,
                "type": field.field_type,
            }
            for field in dynamic_fields
        ]

        employee_qs = selected_department.employees.all().order_by("-created_at")

        if search_query:
            matching_employee_ids = EmployeeFieldData.objects.filter(
                employee__in=employee_qs,
                value__icontains=search_query
            ).values_list('employee_id', flat=True).distinct()
            employee_qs = employee_qs.filter(id__in=matching_employee_ids)

        fdata = EmployeeFieldData.objects.filter(employee__in=employee_qs).select_related('field', 'employee')

        fdata_map = {}
        for fd in fdata:
            fdata_map.setdefault(fd.employee_id, {})[str(fd.field_id)] = fd.value

        employees_data = []
        for emp in employee_qs:
            row = {
                "id": emp.id,
                "created_at": emp.created_at,
                "field_data": {},
            }
            for field in dynamic_fields:
                val = fdata_map.get(emp.id, {}).get(str(field.id), "") or "-"
                row["field_data"][str(field.id)] = val
            employees_data.append(row)

        paginator = Paginator(employees_data, 5) 
        try:
            employees_data = paginator.page(page)
        except PageNotAnInteger:
            employees_data = paginator.page(1)
        except EmptyPage:
            employees_data = paginator.page(paginator.num_pages)

    context = {
        'departments': departments,
        'selected_department': selected_department,
        'columns': columns,
        'employees': employees_data,
        'total_count': len(employees_data) if isinstance(employees_data, list) else employees_data.paginator.count,
        'search_query': search_query,
        'department_id': department_id,
        'current_page': employees_data.number if hasattr(employees_data, 'number') else 1,
        'total_pages': employees_data.paginator.num_pages if hasattr(employees_data, 'paginator') else 1,
    }
    return render(request, 'employee_details.html', context)

@login_required
def employee_edit(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)

    if request.method == 'POST':
        for field_data in employee.field_data.all():
            field_id = str(field_data.field.id)
            value = request.POST.get(field_id)

            if field_data.field.field_type == 'boolean':
                value = (value == 'on') 

            if value is not None:
                field_data.value = value
                field_data.save()

        return redirect('employee_details') 

    dynamic_fields = DynamicField.objects.filter(department=employee.department).order_by('order')

    field_data_dict = {str(field_data.field.id): field_data.value for field_data in employee.field_data.all()}

    context = {
        'employee': employee,
        'dynamic_fields': dynamic_fields,
        'field_data_dict': field_data_dict,
    }
    return render(request, 'employee_edit.html', context)


@login_required
def employee_delete(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    if request.method == 'POST':
        employee.delete()
        messages.success(request, 'Employee deleted successfully.')
        return redirect('employee_details') 

    context = {
        'employee': employee,
    }
    return render(request, 'employee_delete.html', context)


@login_required
def employee_create(request):
    user = request.user
    departments = Department.objects.filter(created_by=user, fields__isnull=False).distinct()

    selected_department_id = request.GET.get("department")
    selected_department = None
    dynamic_fields = []

    if selected_department_id:
        try:
            selected_department = departments.get(id=selected_department_id)
            dynamic_fields = selected_department.fields.order_by('order').all()
        except Department.DoesNotExist:
            selected_department = None
            dynamic_fields = []

    if request.method == "POST":
        dept_id = request.POST.get("department")
        try:
            selected_department = departments.get(id=dept_id)
            dynamic_fields = selected_department.fields.order_by('order').all()
        except Department.DoesNotExist:
            messages.error(request, "Invalid department selected.")
            selected_department = None
            dynamic_fields = []

        if selected_department:
            employee = Employee.objects.create(department=selected_department)
            for field in dynamic_fields:
                raw_value = request.POST.get(f'field_{field.id}', '')
                if field.field_type == 'boolean':
                    value = raw_value == 'on'
                elif field.field_type == 'number':
                    try:
                        value = int(raw_value)
                    except (ValueError, TypeError):
                        value = None
                else:
                    value = raw_value or ''

                EmployeeFieldData.objects.create(
                    employee=employee,
                    field=field,
                    value=value, )

            messages.success(request, "Employee created successfully.")
            return redirect('employee_details')

    context = {
        'departments': departments,
        'selected_department': selected_department,
        'dynamic_fields': dynamic_fields,
        'is_editing': False,}
    return render(request, 'add_employee.html', context)

@login_required
def department_overview(request):
    user = request.user
    departments = Department.objects.filter(created_by=user).annotate(total_employees=Count('employees'))
    return render(request, 'department_overview.html', {'departments': departments})

@login_required
def department_create(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        label = request.POST.get('label')
        Department.objects.create(name=name, label=label, created_by=request.user)
        messages.success(request, 'Department created successfully!')
        return redirect('department_overview')

    return render(request, 'department_create_edit.html', {'editing': False})

@login_required
def department_edit(request, dept_id):
    department = get_object_or_404(Department, id=dept_id, created_by=request.user)

    if request.method == 'POST':
        department.name = request.POST.get('name')
        department.label = request.POST.get('label')
        department.save()
        messages.success(request, 'Department updated successfully!')
        return redirect('department_overview')

    return render(request, 'department_create_edit.html', {'editing': True, 'd': department})

@login_required
def department_delete(request, dept_id):
    department = get_object_or_404(Department, id=dept_id, created_by=request.user)

    if request.method == 'POST':
        department.delete()
        messages.success(request, 'Department deleted successfully!')
        return redirect('department_overview')

    return render(request, 'department_delete.html', {'department': department})

# @login_required
# def form_create(request):
#     user = request.user
#     departments = Department.objects.filter(
#         created_by=user).exclude(fields__isnull=False).distinct()
#     error = ""
#     success = False

#     if request.method == "POST":
#         dept_id = request.POST.get("department")
#         field_labels = request.POST.getlist("field_label")
#         field_types = request.POST.getlist("field_type")

#         if not (dept_id and field_labels and field_types and len(field_labels) == len(field_types)):
#             error = "Please select a department and add at least one field."
#         else:
#             try:
#                 department = departments.get(id=dept_id)
#             except Department.DoesNotExist:
#                 error = "Invalid department."
#             else:
#                 for i, (lbl, typ) in enumerate(zip(field_labels, field_types)):
#                     if not lbl or not typ:
#                         continue

#                     field_options = None
#                     if typ == 'select':
#                         options = request.POST.getlist(f'field_options_{i}')
#                         field_options = [option.strip() for option in options if option.strip()]

#                     DynamicField.objects.create(
#                         department=department,
#                         label=lbl,
#                         field_type=typ,
#                         field_options=field_options if typ == 'select' else None,
#                         order=i,
#                     )
#                 success = True

#     return render(request, "create_form.html", {"departments": departments,
#         "error": error,
#         "success": success, })

@login_required
def form_create(request):
    user = request.user
    departments = Department.objects.filter(created_by=user).exclude(fields__isnull=False).distinct()
    error = ""
    success = False

    if request.method == "POST":
        dept_id = request.POST.get("department")
        field_labels = request.POST.getlist("field_label")
        field_types = request.POST.getlist("field_type")
        field_orders = request.POST.getlist("field_order")

        if not (dept_id and field_labels and field_types and len(field_labels) == len(field_types)):
            error = "Please select a department and add at least one field."
        else:
            try:
                department = departments.get(id=dept_id)
            except Department.DoesNotExist:
                error = "Invalid department."
            else:
                for i, (lbl, typ) in enumerate(zip(field_labels, field_types)):
                    if not lbl or not typ:
                        continue
                    field_options = None
                    if typ == 'select':
                        options = request.POST.getlist(f'field_options_{i}')
                        field_options = [option.strip() for option in options if option.strip()]

                    order = int(field_orders[i]) if i < len(field_orders) else i

                    DynamicField.objects.create(
                        department=department,
                        label=lbl,
                        field_type=typ,
                        field_options=field_options if typ == 'select' else None,
                        order=order,
                    )
                success = True

    return render(request, "create_form.html", {
        "departments": departments,
        "error": error,
        "success": success,
    })

@login_required
def form_edit(request, department_id):
    department = get_object_or_404(Department, id=department_id)

    if request.method == 'POST':
        field_ids = request.POST.getlist('field_id[]')
        field_labels = request.POST.getlist('field_label[]')
        field_types = request.POST.getlist('field_type[]')
        field_orders = request.POST.getlist('field_order[]')
        deleted_field_ids = request.POST.getlist('deleted_field_id[]')

        DynamicField.objects.filter(id__in=deleted_field_ids).delete()

        for i, field_id in enumerate(field_ids):
            if field_id: 
                field = DynamicField.objects.get(id=field_id, department=department)
                field.label = field_labels[i]
                field.field_type = field_types[i]
                field.order = field_orders[i]
                field.save()
            else: 
                DynamicField.objects.create(
                    department=department,
                    label=field_labels[i],
                    field_type=field_types[i],
                    order=field_orders[i]
                )

        messages.success(request, 'Form updated successfully!')
        return redirect('employee_details') 

    dynamic_fields = DynamicField.objects.filter(department=department).order_by('order')

    context = {
        'department': department,
        'dynamic_fields': dynamic_fields,
    }
    return render(request, 'form_edit.html', context)

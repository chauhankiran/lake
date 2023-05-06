"use strict";

$(function () {
  // TODO: Remove this condition hack
  if ($(location).attr("href").indexOf("/issues/new") !== -1) {
    issueDropdownFields();
  }

  // Bootstrap validation on form submit
  (() => {
    const forms = document.querySelectorAll(".needs-validation");

    Array.from(forms).forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        },
        false
      );
    });
  })();

  // Update the issue dropdown based on selection of the project.
  // TODO: Remove this condition hack
  if ($(location).attr("href").indexOf("/issues/new") !== -1) {
    $("#projectId").on("change", issueDropdownFields);
  }

  function issueDropdownFields() {
    const projectId = $("#projectId").find(":selected").val();
    const priorityDropdown = $("#priorityId").empty();
    const statusDropdown = $("#statusId").empty();
    const typeDropdown = $("#typeId").empty();

    // Ajax call to get priorities
    $.ajax({
      url: "/ajax-priorities-fields?projectId=" + projectId,
      type: "GET",
      success: function (data) {
        for (var d of data) {
          priorityDropdown.append(
            $("<option></option>").attr("value", d.id).text(d.name)
          );
        }
      },
    });

    // Ajax call to get statuses
    $.ajax({
      url: "/ajax-statuses-fields?projectId=" + projectId,
      type: "GET",
      success: function (data) {
        for (var d of data) {
          statusDropdown.append(
            $("<option></option>").attr("value", d.id).text(d.name)
          );
        }
      },
    });

    // Ajax call to get types
    $.ajax({
      url: "/ajax-types-fields?projectId=" + projectId,
      type: "GET",
      success: function (data) {
        for (var d of data) {
          typeDropdown.append(
            $("<option></option>").attr("value", d.id).text(d.name)
          );
        }
      },
    });
  }
});

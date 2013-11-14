/**
 * 
 */
package org.model;

import java.util.ArrayList;

import org.model.interfaces.AbstractGroup;
import org.model.interfaces.IStudent;
import org.model.interfaces.AbstractTask;

/**
 * @author Tamás
 *
 */
public class Group extends AbstractGroup {

	public Group(String groupName) {
		this.groupName = groupName;
		this.students = new ArrayList<IStudent>();
		this.solution = null;
		this.task = null;
		this.taskList = new ArrayList<AbstractTask>();
		this.manager = null;
		this.taskAccepted = false;
		this.canChooseTask = false;
	}
	
}
